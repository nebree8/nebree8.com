package nebree8

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"appengine"
	"appengine/datastore"
	//"appengine/user"
)

const (
	secret          = "SECRET"
	orderEntityType = "Order"
)

type Ingredient struct {
	Parts float32 `json:"parts,omitempty"`
	Drops int     `json:"drops,omitempty"`
	Name  string  `json:"name"`
}

type Order struct {
	DrinkName       string       `json:"drink_name"`
	UserName        string       `json:"user_name"`
	Ingredients     []Ingredient `json:"ingredients"`
	OrderTime       time.Time    `json:"order_time"`
	ProgressPercent int          `json:"progress_percent"`
	DoneTime        time.Time    `json:"done_time"`
	Approved        bool         `json:"approved"`
	TotalOz         float32      `json:"total_oz"`
	Rating          int          `json:"rating"`
}

type OrderStatus struct {
  Approved        bool         `json:"approved"`
	Done            bool         `json:"done"`
	QueuePosition   int          `json:"queue_position"`
  ProgressPercent int          `json:"progress_percent"`
}

type KeyedOrder struct {
	Order
	key *datastore.Key
}

func (o *Order) Key(c appengine.Context) *datastore.Key {
	return datastore.NewIncompleteKey(c, orderEntityType, nil)
}

func (k *KeyedOrder) Put(c appengine.Context) error {
	_, err := datastore.Put(c, k.key, &k.Order)
	return err
}

var ArchivedByStaff time.Time = time.Date(
	2000, time.January, 1, 0, 0, 0, 0, time.UTC);
var CancelledByUser time.Time =  time.Date(
	2000, time.February, 1, 0, 0, 0, 0, time.UTC);

func findOrder(c appengine.Context, encoded_key string) (*KeyedOrder, error) {
	key, err := datastore.DecodeKey(encoded_key)
	if err != nil {
		c.Infof("Bad key %v", encoded_key)
		return nil, err
	}
	order := &KeyedOrder{}
	order.key = key
	if err = datastore.Get(c, key, &order.Order); err != nil {
		c.Infof("Failed to find key %v", encoded_key)
		return nil, err
	}
	return order, nil
}

func mutateAndReturnOrder(w http.ResponseWriter, r *http.Request, f func(*Order) error) {
	c := appengine.NewContext(r)
	order, err := findOrder(c, r.FormValue("key"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := f(&order.Order); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := order.Put(c); err != nil {
		c.Infof("Failed to write back to datastore key=%v", order.key.Encode())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(order)
}

func unpreparedDrinkQueryNewestFirst() *datastore.Query {
	return datastore.NewQuery(orderEntityType).Filter("DoneTime =", time.Time{}).Order("OrderTime")
}

func returnItems(c appengine.Context, q *datastore.Query, w http.ResponseWriter) {
	var orders []Order
	type Item struct {
		Order
		Id string `json:"id"`
	}
	var items []Item
	keys, err := q.GetAll(c, &orders)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for i, o := range orders {
		items = append(items, Item{Order: o, Id: keys[i].Encode()})
	}
	enc := json.NewEncoder(w)
	enc.Encode(items)
}

func init() {
	// External.
	http.HandleFunc("/api/order", orderDrink)
	http.HandleFunc("/api/order_status", orderStatus)
	http.HandleFunc("/api/order_rate", orderRate)
	http.HandleFunc("/api/drink_queue", drinkQueue)
	// Internal.
	http.HandleFunc("/api/next_drink", nextDrink)
	http.HandleFunc("/api/finished_drink", finishedDrink)
	http.HandleFunc("/api/set_drink_progress", drinkProgress)
	http.HandleFunc("/api/approve_drink", approveDrink)
	http.HandleFunc("/api/archive_drink", archiveDrink)
	http.HandleFunc("/api/cancel_drink", cancelDrink)
	http.HandleFunc("/api/set_config", setConfig)
	http.HandleFunc("/api/get_config", getConfig)
}

func orderDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	var order Order
	if body, err := ioutil.ReadAll(r.Body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	} else if err := json.Unmarshal(body, &order); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if order.UserName == "" {
		http.Error(w, "user_name is required", http.StatusBadRequest)
		return
	}
	order.OrderTime = time.Now()
	key, err := datastore.Put(c, order.Key(c), &order)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "{\"id\": \"%v\"}", key.Encode())
}

func orderStatus(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	encoded_key := r.FormValue("key")
	keyed_order, err := findOrder(c, encoded_key)
	key := keyed_order.key
	order := keyed_order.Order
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var status OrderStatus
	status.Done = !order.DoneTime.IsZero()
	status.ProgressPercent = order.ProgressPercent
	status.Approved = order.Approved

	keys, err := unpreparedDrinkQueryNewestFirst().KeysOnly().GetAll(c, nil)
	c.Debugf("keys is %s long", len(keys))
	for i, k := range keys {
		c.Debugf("The key, i: %s %s %s", k, key, i)
		if k.Equal(key) {
			status.QueuePosition = i + 1
			break
		}
	}

	json.NewEncoder(w).Encode(status)
}

func orderRate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	rating, err := strconv.ParseInt(r.FormValue("rating"), 10, 32)
	if err != nil || rating < 0 || rating > 10 {
		c.Infof("Bad value \"%v\" for rating: %v", r.FormValue("rating"), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.Rating = int(rating)
		return nil
	})
}

func nextDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := unpreparedDrinkQueryNewestFirst().Filter("Approved=", true).Limit(10)
	returnItems(c, q, w)
}

func drinkQueue(w http.ResponseWriter, r *http.Request) {
	returnItems(appengine.NewContext(r), unpreparedDrinkQueryNewestFirst(), w)
}

func finishedDrink(w http.ResponseWriter, r *http.Request) {
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.DoneTime = time.Now()
		return nil
	})
}

func approveDrink(w http.ResponseWriter, r *http.Request) {
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.Approved = true
		return nil
	})
}

func cancelDrink(w http.ResponseWriter, r *http.Request) {
	// Essentially the same as archiving, but uses a different "past" value.
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.DoneTime = CancelledByUser;
		return nil
	})  
}

func archiveDrink(w http.ResponseWriter, r *http.Request) {
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.DoneTime = ArchivedByStaff;
		return nil
	})
}

func drinkProgress(w http.ResponseWriter, r *http.Request) {
	// Validate progress argument.
	c := appengine.NewContext(r)
	progress, err := strconv.ParseInt(r.FormValue("progress"), 10, 32)
	if err != nil {
		c.Infof("Bad value \"%v\" for progress: %v", r.FormValue("progress"), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.ProgressPercent = int(progress)
		return nil
	})
}

func setConfig(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	cfg := Config{}
	if (r.FormValue("reset") != "") {
		cfg = defaultConfig
	} else if err := json.Unmarshal([]byte(r.FormValue("config")), &cfg); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := cfg.Put(c); err != nil {
		http.Error(w, fmt.Sprintf("Error: %v, cfg=%v", err.Error(), cfg), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(cfg)
}

func getConfig(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	cfg := Config{}
	if err := cfg.Get(c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(cfg)
}

package nebree8

import (
	"encoding/json"
	"fmt"
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

func init() {
	// External.
	http.HandleFunc("/api/order", orderDrink)
	http.HandleFunc("/api/order_status", orderStatus)
	http.HandleFunc("/api/drink_queue", drinkQueue)
	// Internal.
	http.HandleFunc("/api/next_drink", nextDrink)
	http.HandleFunc("/api/finished_drink", finishedDrink)
	http.HandleFunc("/api/set_drink_progress", drinkProgress)
	http.HandleFunc("/api/approve_drink", approveDrink)
	http.HandleFunc("/api/archive_drink", archiveDrink)
}

func orderDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	var order Order
	if err := json.Unmarshal([]byte(r.FormValue("recipe")), &order); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if order.UserName == nil || order.UserName == "" {
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
	order, err := findOrder(c, r.FormValue("key"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	status := "unknown"
	if !order.DoneTime.IsZero() {
		status = "Done"
	} else if order.ProgressPercent > 0 {
		status = fmt.Sprintf("%v%% done", order.ProgressPercent)
	} else if !order.Approved {
		status = "Insert coins to continue"
	}
	fmt.Fprintf(w, "%v", status)
}

func nextDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := unpreparedDrinkQueryNewestFirst().Filter("Approved=", true).Limit(10)
	var orders []Order
	if _, err := q.GetAll(c, &orders); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	enc := json.NewEncoder(w)
	enc.Encode(orders)
}

func drinkQueue(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := unpreparedDrinkQueryNewestFirst()
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

func archiveDrink(w http.ResponseWriter, r *http.Request) {
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.DoneTime = time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC)
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
	}
	mutateAndReturnOrder(w, r, func(o *Order) error {
		o.ProgressPercent = int(progress)
		return nil
	})
}

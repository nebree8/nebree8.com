package nebree8

import (
	"encoding/json"
	"fmt"
	"net/http"
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
	Parts int    `json:"parts,omitempty"`
	Drops int    `json:"drops,omitempty"`
	Name  string `json:"name"`
}

type Order struct {
	DrinkName       string       `json:"drink_name"`
	UserName        string       `json:"user_name"`
	Ingredients     []Ingredient `json:"ingredients"`
	OrderTime       time.Time    `json:"order_time"`
	ProgressPercent int          `json:"progress_percent"`
	DoneTime        time.Time    `json:"done_time"`
	Approved        bool         `json:"approved"`
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
		return nil, err
	}
	order := &KeyedOrder{}
	order.key = key
	if err = datastore.Get(c, key, &order.Order); err != nil {
		return nil, err
	}
	return order, nil
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
	http.HandleFunc("/api/approve_drink", approveDrink)
}

func orderDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	var order Order
	if err := json.Unmarshal([]byte(r.FormValue("recipe")), &order); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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
		status = fmt.Sprintf("%v%v done", order.ProgressPercent)
	} else if !order.Approved {
		status = "Insert coins to continue"
	}
	fmt.Fprintf(w, "%v", status)
}

func nextDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := unpreparedDrinkQueryNewestFirst().Filter("Approved=", true).Limit(1)
	var orders []Order
	if _, err := q.GetAll(c, &orders); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if len(orders) == 0 {
		http.Error(w, "No orders", http.StatusNotFound)
		return
	}
	enc := json.NewEncoder(w)
	enc.Encode(orders[0])
}

func drinkQueue(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := unpreparedDrinkQueryNewestFirst()
	var orders []Order
	if _, err := q.GetAll(c, &orders); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	enc := json.NewEncoder(w)
	enc.Encode(orders)
}

func finishedDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	order, err := findOrder(c, r.FormValue("key"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	order.DoneTime = time.Now()
	if err := order.Put(c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func approveDrink(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	order, err := findOrder(c, r.FormValue("key"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	order.Approved = true
	if err := order.Put(c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

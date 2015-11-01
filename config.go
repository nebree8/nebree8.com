package nebree8

import (
	"appengine"
	"appengine/datastore"
)

const (
	configEntityType = "Config"
	configEntityId   = 1
)

type IngredientAvailability struct {
	Name      string
	Available bool
}

type Config struct {
	Ingredients []IngredientAvailability
}

var defaultConfig = Config{
	Ingredients: []IngredientAvailability{
		{Name: "tequila", Available: true},
		{Name: "lime juice", Available: true},
		{Name: "agave syrup", Available: true},
		{Name: "bourbon", Available: true},
		{Name: "galliano", Available: true},
		{Name: "chocolate bitters", Available: true},
		{Name: "scotch", Available: true},
		{Name: "rye", Available: true},
		{Name: "rum", Available: true},
		{Name: "vodka", Available: true},
		{Name: "triple sec", Available: true},
		{Name: "frangelico", Available: true},
		{Name: "angostura bitters", Available: true},
		{Name: "sweet vermouth", Available: true},
		{Name: "kahlua", Available: true},
		{Name: "gin", Available: true},
		{Name: "campari", Available: true},
		{Name: "dry vermouth", Available: true},
		{Name: "peychauds bitters", Available: true},
		{Name: "agave", Available: true},
		{Name: "pimms", Available: true},
		{Name: "grenadine", Available: true},
		{Name: "simple syrup", Available: true},
		{Name: "lemon juice", Available: true},
		{Name: "lime", Available: true},
		{Name: "orange bitters", Available: true},
		{Name: "orange", Available: true},
		{Name: "tonic", Available: true},
		{Name: "cola", Available: true},
		{Name: "water", Available: true},
		{Name: "soda", Available: true},
		{Name: "peach schnapps", Available: false},
		{Name: "honey", Available: false},
		{Name: "maple syrup", Available: false},
	},
}

func (cfg *Config) Key(c appengine.Context) *datastore.Key {
	return datastore.NewKey(c, configEntityType, "", configEntityId, nil)
}

func (cfg *Config) Get(c appengine.Context) error {
	err := datastore.Get(c, cfg.Key(c), cfg)
	if err == datastore.ErrNoSuchEntity {
		defaultConfig.Put(c)
		*cfg = defaultConfig
		return nil
	}
	return err
}

func (cfg *Config) Put(c appengine.Context) error {
	_, err := datastore.Put(c, cfg.Key(c), cfg)
	return err
}

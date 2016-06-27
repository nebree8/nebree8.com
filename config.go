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
		{Name: "agave syrup", Available: true},
		{Name: "amaretto", Available: false},
		{Name: "angostura bitters", Available: true},
		{Name: "bourbon", Available: true},
		{Name: "campari", Available: true},
		{Name: "chocolate bitters", Available: false},
		{Name: "cola", Available: true},
		{Name: "dry vermouth", Available: true},
		{Name: "frangelico", Available: true},
		{Name: "galliano", Available: true},
		{Name: "gin", Available: true},
		{Name: "grenadine", Available: true},
		{Name: "honey syrup", Available: false},
		{Name: "kahlua", Available: true},
		{Name: "lemon juice", Available: true},
		{Name: "lime juice", Available: true},
		{Name: "maple syrup", Available: false},
		{Name: "mescal", Available: true},
		{Name: "orange bitters", Available: false},
		{Name: "orange juice", Available: true},
		{Name: "peach schnapps", Available: false},
		{Name: "peppermint schnapps", Available: false},
		{Name: "peychauds bitters", Available: false},
		{Name: "pimms", Available: false},
		{Name: "rum", Available: true},
		{Name: "rose", Available: true},
		{Name: "rye", Available: true},
		{Name: "scotch", Available: false},
		{Name: "simple syrup", Available: true},
		{Name: "soda", Available: true},
		{Name: "sweet vermouth", Available: true},
		{Name: "tequila", Available: true},
		{Name: "tonic", Available: true},
		{Name: "triple sec", Available: true},
		{Name: "vodka", Available: true},
		{Name: "water", Available: true},
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

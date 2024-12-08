-- Table: IngredientNutrientValue
CREATE TABLE Ingredient_nutrient_value (
    id INTEGER NOT NULL PRIMARY KEY,
    ingredient_code INTEGER,
    ingredient_description TEXT,
    nutrient_code INTEGER,
    nutrient_value REAL,
    nutrient_value_source TEXT,
    fdc_id INTEGER NOT NULL,
    derivation_code TEXT,
    sr_addMode DATE,
    foundation_year_acquired INTEGER,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (derivation_code) REFERENCES Derivation(derivation_code)

);

-- Table: Food
CREATE TABLE Food (
    fdc_id INTEGER NOT NULL PRIMARY KEY,
    data_type TEXT NOT NULL,
    description TEXT NOT NULL,
    food_category_id INTEGER,
    publication_date DATE
);

-- Table: FoodAttribute
CREATE TABLE Food_attribute (
    id INTEGER NOT NULL PRIMARY KEY,
    fdc_id INTEGER NOT NULL,
    seq_num INTEGER,
    food_attribute_type_id INTEGER,
    name TEXT,
    value TEXT,
    FOREIGN KEY (fdc_id) REFERENCES Food(fdc_id),
    FOREIGN KEY (food_attribute_type_id) REFERENCES FoodAttributeType(id)
);

-- Table: FoodAttributeType
CREATE TABLE Food_attribute_type (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

-- Table: FoodNutrient
CREATE TABLE Food_nutrient (
    id INTEGER NOT NULL PRIMARY KEY,
    fdc_id INTEGER NOT NULL,
    nutrient_id INTEGER NOT NULL,
    amount REAL,
    data_points INTEGER,
    derivation_id TEXT,
    min REAL,
    max REAL,
    median REAL,
    footnote TEXT,
    min_year_acquired INTEGER,
    FOREIGN KEY (fdc_id) REFERENCES Food(fdc_id),
    FOREIGN KEY (nutrient_id) REFERENCES Nutrient(id),
    FOREIGN KEY (derivation_id) REFERENCES Derivation(derivation_code)
);

-- Table: Derivation
CREATE TABLE Derivation (
    derivation_code TEXT NOT NULL PRIMARY KEY,
    derivation_description TEXT
);

-- Table: FoodPortionData
CREATE TABLE Food_portion (
    id INTEGER NOT NULL PRIMARY KEY,
    fdc_id INTEGER NOT NULL,
    seq_num INTEGER,
    amount REAL,
    measure_unit_id INTEGER,
    portion_description TEXT,
    modifier TEXT,
    gram_weight REAL,
    data_points INTEGER,
    footnote TEXT,
    min_year_acquired INTEGER,
    FOREIGN KEY (fdc_id) REFERENCES Food(fdc_id),
    FOREIGN KEY (measure_unit_id) REFERENCES MeasureUnit(id)
);

-- Table: MeasureUnit
CREATE TABLE Measure_unit (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT
);

-- Table: SurveyFood
CREATE TABLE Survey_food (
    fdc_id INTEGER NOT NULL PRIMARY KEY,
    food_code INTEGER NOT NULL,
    wweia_category_number INTEGER,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (fdc_id) REFERENCES Food(fdc_id),
    FOREIGN KEY (wweia_category_number) REFERENCES WweiaFoodCategory(wweia_food_category)
);

-- Table: Nutrient
CREATE TABLE Nutrient (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    nutrient_nbr INTEGER NOT NULL,
    rank INTEGER
);

-- Table: InputData
CREATE TABLE Input_food (
    id INTEGER NOT NULL PRIMARY KEY,
    fdc_id INTEGER NOT NULL,
    fdc_of_input_food INTEGER,
    seq_num INTEGER,
    amount REAL,
    sr_code TEXT,
    sr_description TEXT,
    unit TEXT NOT NULL,
    portion_code INTEGER,
    portion_description TEXT,
    gram_weight REAL,
    retention_code INTEGER,
    FOREIGN KEY (fdc_id) REFERENCES Food(fdc_id)
);

-- Table: WweiaFoodCategory
CREATE TABLE Wweia_food_category (
    wweia_food_category TEXT NOT NULL PRIMARY KEY,
    wweia_food_category_description TEXT
);

-- Table: identified_meat_ingredients
CREATE TABLE Identified_meat_ingredients(
    ingredient_code NOT NULL PRIMARY KEY,
    is_meat TEXT
);


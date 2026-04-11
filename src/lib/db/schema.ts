import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ Domain ============

export const seasonEnum = pgEnum("season", ["verao", "inverno", "neutro"]);

export const sizePeriods = pgTable("size_periods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  display_order: integer("display_order").notNull().default(0),
});

export const clothingTypes = pgTable("clothing_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clothes = pgTable("clothes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clothing_type_id: uuid("clothing_type_id")
    .notNull()
    .references(() => clothingTypes.id, { onDelete: "restrict" }),
  size_period_id: uuid("size_period_id")
    .notNull()
    .references(() => sizePeriods.id, { onDelete: "restrict" }),
  season: seasonEnum("season").notNull().default("neutro"),
  photo_url: text("photo_url"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enxovais = pgTable("enxovais", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enxovalItems = pgTable(
  "enxoval_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    enxoval_id: uuid("enxoval_id")
      .notNull()
      .references(() => enxovais.id, { onDelete: "cascade" }),
    clothing_type_id: uuid("clothing_type_id")
      .notNull()
      .references(() => clothingTypes.id, { onDelete: "restrict" }),
    size_period_id: uuid("size_period_id")
      .notNull()
      .references(() => sizePeriods.id, { onDelete: "restrict" }),
    target_quantity: integer("target_quantity").notNull().default(1),
  },
  (t) => ({
    uniqPerEnxoval: unique().on(t.enxoval_id, t.clothing_type_id, t.size_period_id),
  })
);

// ---- Relations (for db.query.* relational selects) ----

export const clothesRelations = relations(clothes, ({ one }) => ({
  clothing_types: one(clothingTypes, {
    fields: [clothes.clothing_type_id],
    references: [clothingTypes.id],
  }),
  size_periods: one(sizePeriods, {
    fields: [clothes.size_period_id],
    references: [sizePeriods.id],
  }),
}));

export const enxovaisRelations = relations(enxovais, ({ many }) => ({
  enxoval_items: many(enxovalItems),
}));

export const enxovalItemsRelations = relations(enxovalItems, ({ one }) => ({
  enxoval: one(enxovais, {
    fields: [enxovalItems.enxoval_id],
    references: [enxovais.id],
  }),
  clothing_types: one(clothingTypes, {
    fields: [enxovalItems.clothing_type_id],
    references: [clothingTypes.id],
  }),
  size_periods: one(sizePeriods, {
    fields: [enxovalItems.size_period_id],
    references: [sizePeriods.id],
  }),
}));


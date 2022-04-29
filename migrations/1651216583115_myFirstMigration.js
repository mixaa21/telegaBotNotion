/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn("tracking", {
        notion_link: {
            type: "varchar(1000)",
            notNull: false
        }
    })
};

exports.down = pgm => {};

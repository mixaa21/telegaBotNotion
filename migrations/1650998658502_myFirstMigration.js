/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("tracking", {
        status: {
            type: "varchar(1000)",
            notNull: false
        }
    })
};

exports.down = pgm => {};

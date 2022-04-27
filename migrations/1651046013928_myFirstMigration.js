/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("tracking", {
        task_id: {
            type: "varchar(1000)",
            notNull: false
        }
    })
};

exports.down = pgm => {};

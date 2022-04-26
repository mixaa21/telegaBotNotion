/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("user", {
        mail: {
            type: "varchar(1000)",
            notNull: true
        }
    })
    pgm.addColumns("user", {
        notion_id: {
            type: "varchar(1000)",
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropColumns("user", {
        mail: {
            type: "varchar(1000)",
            notNull: true
        }
    })
    pgm.dropColumns("user", {
        notion_id: {
            type: "varchar(1000)",
            notNull: true
        }
    })
};

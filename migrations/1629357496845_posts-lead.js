/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('user', {
        skip_clients: { type: 'varchar(1000)', notNull: false }
    })
};

exports.down = pgm => {};

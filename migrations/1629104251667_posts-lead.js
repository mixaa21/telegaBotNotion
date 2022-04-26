/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('user', {
        skip_clients: { type: 'text[][]', notNull: false}
    })
};

exports.down = pgm => {};

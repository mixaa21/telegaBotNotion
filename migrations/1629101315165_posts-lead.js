/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('user', {
        skipClients: { type: 'text[][]', notNull: false }
    })
};

exports.down = pgm => {};

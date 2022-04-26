/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('clients', {
        visible: { type: 'boolean', default: true }
    })
};

exports.down = pgm => {};

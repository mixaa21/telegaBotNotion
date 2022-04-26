/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.renameColumn('tracking', 'clients', 'client')
};

exports.down = pgm => {};

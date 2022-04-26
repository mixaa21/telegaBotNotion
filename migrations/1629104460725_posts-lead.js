/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropColumns('user', {
        skipClients: { type: 'varchar(1000)', notNull: false }
    })
};

exports.down = pgm => {};

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns( 'user', {
        timestamp: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    }),
    pgm.dropColumns('tracking', {
        date: { type: 'varchar(1000)', notNull: false }
    })
    pgm.addColumns('tracking', {
        timestamp: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    }),
    pgm.addColumns('clients', {
        project: { type: 'text[][]', notNull: false },
    }),
    pgm.renameColumn('clients', 'createdAt', 'timestamp')
};

exports.down = pgm => {};

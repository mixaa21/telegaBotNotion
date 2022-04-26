/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('notifications', {
        id: 'id',
        chat_id: { type: 'varchar(1000)', notNull: true },
        message: { type: 'varchar(1000)', notNull: true },
        timestamp: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        alert_date: {
            type: 'timestamp',
            notNull: true
        }
    })
};

exports.down = pgm => {};

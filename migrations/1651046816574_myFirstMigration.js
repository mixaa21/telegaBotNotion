/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('notion_tasks', {
        id: { type: 'varchar(1000)', notNull: true, primaryKey: true },
        title: { type: 'varchar(1000)', notNull: true },
        client: { type: 'varchar(1000)', notNull: true },
        project: { type: 'varchar(1000)', notNull: true },
        status: { type: 'varchar(1000)', notNull: true }
    })
};

exports.down = pgm => {};

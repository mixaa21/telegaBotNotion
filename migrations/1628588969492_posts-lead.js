/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.renameColumn('tracking', 'project', 'clients')
    pgm.addColumns('tracking', {
        project: { type: 'varchar(1000)', notNull: false }
    })
};

exports.down = pgm => {};

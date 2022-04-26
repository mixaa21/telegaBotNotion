exports.up = (pgm) => {
  pgm.createTable('user', {
    id: 'id',
    name: { type: 'varchar(1000)', notNull: true },
    telegram_chat_id: { type: 'integer' },
    page_id: { type: 'integer' },
    spreadsheet_id: { type: 'varchar(1000)' }
  })
  pgm.createTable('tracking', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: false
    },
    time: { type: 'varchar(1000)', notNull: false },
    date: { type: 'varchar(1000)', notNull: false },
    title: { type: 'varchar(1000)', notNull: false },
    project: { type: 'varchar(1000)', notNull: false },
    sended_to_google: { type: 'bool', default: false }
  })
  pgm.createTable('clients', {
      id: 'id',
      createdAt: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
      name: { type: 'varchar(1000)' },
    })
}

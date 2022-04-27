const { Client } = require('@notionhq/client');
require('dotenv').config();

module.exports = class NotionService {
  notion = new Client({
    auth: 'secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek',
  });
  databaseId = '1ae042298a32413a8475200b8f165dda';

  async getUsersList() {
    return await this.notion.users.list({});
  }
// создать новую задачу
  async createTask(title) {
    return this.notion.pages.create({
      parent: {
        database_id: this.databaseId,
      },
      properties: {
        Name: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: title,
              },
            },
          ],
        },
      },
    });
  }

  // получить задачи юзера у которых статус сделать или в процессе
  async getAllTasks() {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
    });
    return res.results
  }

// получить задачи юзера у которых статус сделать или в процессе
  async getActiveTasks(userId) {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
        and: [{
          property: "Assignee",
          people: {
            contains: userId
          }
        },
          {
            or: [{
                property: "Status",
                select: {
                  equals: "To Do"
                }
            },{
              property: "Status",
              select: {
                equals: "In Progress"
              }
            }]
          }
        ]
      }
    });
    return res.results
  }

  // получить задачи юзера у которых статус ToDo
  async getTasksToDoByUserId(userId) {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
        and: [{
          property: "Assignee",
          people: {
            contains: userId
          }
        },
          {
              property: "Status",
              select: {
                equals: "To Do"
              }
          }
        ]
      }
    });
    return  res.results
  }

  // получить задачи юзера у которых статус InProgress
  async getTasksInProgressByUserId(userId) {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
        and: [{
          property: "Assignee",
          people: {
            contains: userId
          }
        },
          {
            property: "Status",
            select: {
              equals: "In Progress"
            }
          }
        ]
      }
    });
    return  res.results
  }

  // получить задачи по клиенту
  async getTasksByClient() {
    return await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
          property: "Client",
          rich_text: {
            contains: "WormSoft"
          }
        }
    });
  }

// обновление статуса задачи на Done
  async updateTask(padeId) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          'Status': {
            select: {
              name: "Done",
            },
          },
        },
      });
      console.log(response);
    })();
  }

// получить notion_id юзера по email
  async getUsersByEmail(mail) {
    let obj = await this.getUsersList()
    obj = obj.results.filter(item => {
      if (item.type === "person") {
        return item.person.email === mail
      }
    })
    return obj[0].id
  }

}

// const notion = new NotionService()
//
// notion.getAllTasks()
//
// notion.getTasksByUserId().then((res) => {
//   console.log(res)
// })
// notion.getTasksByUserId()

// notion.getTasksByClient().then((res) => {
//   console.log(res)
// })
// notion.getTasksByClient()

// async function getUsers () {
//   let obj = await notion.getUsersList()
//   obj = obj.results.filter(item => {
//     if (item.type === "person") {
//       return item.person.email === "mixaa21@bk.ru"
//     }
//   })
//   console.log(obj[0].id);
// }
// getUsers()

// notion.updateTask()
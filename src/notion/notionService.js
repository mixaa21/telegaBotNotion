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
  async getTasksByUserId(userId) {
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
    const taskArr = res.results.map(item => {
      return item.properties.Name.title[0].plain_text
    })
    let tasks = ""
    for (let i = 0; i < taskArr.length; i++) {
      tasks += '\n' + taskArr[i]
    }
    return tasks
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
    const taskArr = res.results.map(item => {
      return item.properties.Name.title[0].plain_text
    })
    let tasks = ""
    for (let i = 0; i < taskArr.length; i++) {
      tasks += '\n' + taskArr[i]
    }
    return tasks
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
    const taskArr = res.results.map(item => {
      return item.properties.Name.title[0].plain_text
    })
    let tasks = ""
    for (let i = 0; i < taskArr.length; i++) {
      tasks += '\n' + taskArr[i]
    }
    return tasks
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
  async updateTask() {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const pageId = '8b589d41-10fd-4091-b4db-c98999dc0281';
      const response = await notion.pages.update({
        page_id: pageId,
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
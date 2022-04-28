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
  async createTask(client, project, title, assigneesArr) {
    return this.notion.pages.create({
      parent: {
        database_id: this.databaseId,
      },
      properties: {
        Status: {
          type: "select",
          select:
            {
              id: "1",
              name: "To Do",
              color: "blue"
            }
        },
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
        Assignee: {
          type: "people",
          people: assigneesArr
        },
        Client: {
          type: "rich_text",
          rich_text: [{
            text: {
              content: client
            }
          }]
        },
        Project: {
          type: "select",
          select: {
            name: project
          }
        }
      },
    });
  }

  // получить все задачи
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

// обновление статуса задачи на To Check
  async updateStatusTaskToCheck(padeId) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          'Status': {
            select: {
              name: "To Check",
            },
          },
        },
      });
    })();
  }

  // обновление статуса задачи на In Progress
  async updateStatusTaskInProgress(padeId) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          'Status': {
            select: {
              name: "In Progress",
            },
          },
        },
      });
    })();
  }

  // обновить исполнителей в задаче
  async updateAssigneeTask(padeId, assigneesArr) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          Assignee: {
            type: "people",
            people: assigneesArr
          },
        },
      });
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
    if (obj.length) {
      return obj[0].id
    } else {
      return null
    }
  }

}

// const notion = new NotionService()
//
//
// padeId = "59c107f5-f668-400f-8313-9eff93441a20"
// arr = [{
//   id: "1f167101-c12f-4162-b0da-8216155c33bc",
//   person: {}
// },{
//   id: "5f72d0eb-af7a-48d9-95cd-cee1f802e9f6",
//   person: {}
// }]
//
// notion.updateAssigneeTask(padeId, arr)


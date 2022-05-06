const { Client } = require('@notionhq/client');
require('dotenv').config();

module.exports = class NotionService {
  notion = new Client({
    auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek",
  });
  databaseId
  constructor(databaseId) {
    this.databaseId = databaseId
  }

// создать новую задачу
  async createTask(title, assigneesArr) {
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
        Client:  {
          type: "select",
          select: {
            name: client
          }
        },
        Project: {
          id: "ZnYf",
          type: "relation",
          relation: [{
            id: "c29eba40-5861-40a7-9f19-0a01fcc3ff36"
          }]
        }
      },
    });
  }

  async deleteTask(arrId) {
    const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
    arrId.forEach(async id => {
      const response = await notion.blocks.delete({
        block_id: id,
      });
    })
  }

  // получить всех юзеров в рабочей области
  async getUsersList() {
    return await this.notion.users.list({})
  }

  // получить все задачи отсортированные по статусу
  async getAllTasksSortStatus() {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      "sorts": [
      {
        "property": "Status",
        "direction": "ascending"
      }
    ]
    });
    return res.results
  }
  // получить все страницы из базы данных в notion
  async getAllPages() {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
    });
    return res.results
  }

  // получить все задачи отсортированные по времени создания
  async getAllTasksSortCreateTime() {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
    });
    return res.results
  }

// получить задачи юзера у которых статус сделать или в процессе
  async getActiveTasks(userId) {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      sorts: [
        {
          "property": "Status",
          "direction": "ascending"
        }
      ],
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
          select: {
            name: client
          }
        }
    });
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

// обновление статуса задачи
  async updateStatusTask(padeId, status) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          'Status': {
            select: {
              name: status,
            },
          },
        },
      });
    })();
  }

  // обновление клиента задачи
  async updateClientTask(padeId, client) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          Client:  {
            type: "select",
            select: {
              name: client
            }
          },
        },
      });
    })();
  }

  // обновление проекта задачи
  async updateProjectTask(padeId, project) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
        properties: {
          Client:  {
            type: "select",
            select: {
              name: project
            }
          },
        },
      });
    })();
  }

  // обновление постановки задачи
  async updateNameTask(padeId, title) {
    (async () => {
      const notion = new Client({ auth: "secret_d56RsiCIaw51C1NgmJE24QMosHcFvFv3Uptq1aYSKek" });
      const response = await notion.pages.update({
        page_id: padeId,
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

  // добавить проекты в notion
  async createProject(projectArr) {
    projectArr.forEach(title => {
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
    })
  }

}

// const notion = new NotionService("567b3e16a80d4055851be9772bdddf55")
//
// notion.getAllPages()
//
// notion.deleteTask(["9e307cf9-95a3-4cdb-8029-4a323bff3078","705c6729-0fc0-4e9e-93e8-050953eade51"])

// padeId = "59c107f5-f668-400f-8313-9eff93441a20"
// arr = [{
//   id: "1f167101-c12f-4162-b0da-8216155c33bc",
//   person: {}
// },{
//   id: "5f72d0eb-af7a-48d9-95cd-cee1f802e9f6",
//   person: {}
// }]
//
// notion.createTask("hello")
//
// notion.updateAssigneeTask(padeId, arr)


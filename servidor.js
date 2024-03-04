const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

const app = express();
const port = 3001;
app.use(cors());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

const Category = sequelize.define("Category", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  budget: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  importance: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Definición del modelo de Gasto
const Expense = sequelize.define("Expense", {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
});

// Relación entre Categoría y Gasto
Category.hasMany(Expense);
Expense.belongsTo(Category);

// Relación entre Categoría y Gasto (sin cambios)
Category.hasMany(Expense);
Expense.belongsTo(Category);

app.use(express.json());

// Rutas (sin cambios)
app.get("/categories", async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

app.post("/categories", async (req, res) => {
  const { name, budget, importance } = req.body;
  const category = await Category.create({ name, budget, importance });
  res.json(category);
});

app.post("/expenses", async (req, res) => {
  const { categoryId, amount, description } = req.body;
  const expense = await Expense.create({ amount, description, categoryId });
  res.json(expense);
});

// Lógica para simular notificaciones periódicas
const simulatePeriodicNotificationsWithImportance = () => {
  setInterval(() => {
    console.log("Sending periodic notifications with importance...");
    app.get("/simulate-early-notification", async (req, res) => {
      try {
        const currentDate = new Date();
        const categories = await Category.findAll();

        const notifications = categories
          .filter((category) => {
            const notificationDate = new Date(category.createdAt);
            const interval = calculateNotificationInterval(category.importance);
            notificationDate.setMilliseconds(
              notificationDate.getMilliseconds() + interval
            );

            return currentDate > notificationDate;
          })
          .map((category) => ({ categoryName: category.name }));

        res.json(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  }, 20000);
};

// Nueva función para calcular el intervalo de notificación basado en la importancia
const calculateNotificationInterval = (importance) => {
  // Establecer un intervalo base de 20 segundos
  let interval = 20000;

  // Ajustar el intervalo según la importancia
  switch (importance) {
    case "2":
      interval = 15000; // Reducir el intervalo para importancia media
      break;
    case "3":
      interval = 10000; // Reducir aún más para alta importancia
      break;
    default:
      break;
  }

  return interval;
};

// Sincronizar modelos con la base de datos
sequelize.sync().then(() => {
  // Utilizar la nueva función para simular notificaciones periódicas con importancia
  simulatePeriodicNotificationsWithImportance();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

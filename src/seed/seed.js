import sequelize from "../../src/config/database.js";
import Branch from "../../src/models/Branch.js";

const seedDatabase = async () => {
  try {
    // Sincroniza el modelo con la base de datos
    console.log("Sediando informacion");
    await sequelize.sync({ force: false });

    // Crea las sucursales
    const branchesData = [
      {
        name: "Sucursal 1",
        email: "sucursal1@example.com",
        phoneNumber: 123456789,
        address: "Dirección 1",
        capacity: 50,
        openingTime: "09:00 AM",
        closingTime: "06:00 PM",
        turnDuration: 30,
      },
      {
        name: "Sucursal 2",
        email: "sucursal2@example.com",
        phoneNumber: 987654321,
        address: "Dirección 2",
        capacity: 30,
        openingTime: "10:00 AM",
        closingTime: "07:00 PM",
        turnDuration: 30,
      },
      // Agrega más sucursales según sea necesario
    ];

    const branches = await Branch.bulkCreate(branchesData);
    //console.log(branches);

    console.log("Seeding completado");
    process.exit(); // Esto cierra el proceso después de realizar el seeding
  } catch (error) {
    console.error("Error en el seeding:", error);
    process.exit(1); // Esto cierra el proceso con un código de error
  }
};

seedDatabase();

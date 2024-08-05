const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const Sequelize = require('sequelize');
const { Vehicle } = require('./models');

const app = express();
const port = 4000;

// GraphQL schema
const schema = buildSchema(`
  type Vehicle {
    id: ID!
    vehicleNumber: String!
    manufacturedYear: Int!
    modelName: String!
  }

  type Query {
    getVehicle(id: ID!): Vehicle
    getVehicles: [Vehicle]
  }

  type Mutation {
    addVehicle(vehicleNumber: String!, manufacturedYear: Int!, modelName: String!): Vehicle
    editVehicle(id: ID!, vehicleNumber: String, manufacturedYear: Int, modelName: String): Vehicle
    deleteVehicle(id: ID!): Vehicle
  }
`);

// GraphQL resolvers
const root = {
  getVehicle: async ({ id }) => {
    return await Vehicle.findByPk(id);
  },
  getVehicles: async () => {
    return await Vehicle.findAll();
  },
  addVehicle: async ({ vehicleNumber, manufacturedYear, modelName }) => {
    return await Vehicle.create({ vehicleNumber, manufacturedYear, modelName });
  },
  editVehicle: async ({ id, vehicleNumber, manufacturedYear, modelName }) => {
    const vehicle = await Vehicle.findByPk(id);
    vehicle.vehicleNumber = vehicleNumber || vehicle.vehicleNumber;
    vehicle.manufacturedYear = manufacturedYear || vehicle.manufacturedYear;
    vehicle.modelName = modelName || vehicle.modelName;
    await vehicle.save();
    return vehicle;
  },
  deleteVehicle: async ({ id }) => {
    const vehicle = await Vehicle.findByPk(id);
    await vehicle.destroy();
    return vehicle;
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/graphql`);
});

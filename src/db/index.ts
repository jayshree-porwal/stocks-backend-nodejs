import { Sequelize, Dialect, QueryTypes } from 'sequelize';
import config from '../config';

import DailyPriceSchema from './schema/DailyPrice';
import DailyScanData from './schema/DailyScanData';
import Scanners from './schema/Scanners';
import SearchTerm from './schema/SearchTerm';
import StockVerdict from './schema/StockVerdict';
import Symbol from './schema/Symbol';
import StockReversalData from './schema/StockReversalData';
import StockReversalDataScan from './schema/StockReversalDataScan';

const { PRODUCTION } = config;

const dbOptions = config.DB;

const sequelize = new Sequelize(
  dbOptions.DB_NAME!,
  dbOptions.DB_USER!,
  dbOptions.DB_PASS,
  {
    host: dbOptions.DB_HOST,
    port: +dbOptions.DB_PORT!,
    dialect: dbOptions.DB_TYPE as Dialect,
    pool: {
      max: 10,
      min: 2,
      acquire: 60000,
      idle: 30000,
    },
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      }
    },
    logging: false,
  },

);

const models = {
  DailyPrice: DailyPriceSchema(sequelize),
  DailyScanData: DailyScanData(sequelize),
  Scanners: Scanners(sequelize),
  SearchTerm: SearchTerm(sequelize),
  StockVerdict: StockVerdict(sequelize),
  Symbol: Symbol(sequelize),
  StockReversalData: StockReversalData(sequelize),
  StockReversalDataScan: StockReversalDataScan(sequelize)
}

models.StockVerdict.belongsTo(models.Symbol, { foreignKey: "stock_id", as: "symbol" });

export default {
  models,
  connect() {
    return sequelize;
  },
  connection: sequelize,
  Sequelize,
  QueryTypes,
};

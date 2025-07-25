import bunyan, { LoggerOptions } from "bunyan";
import config from "../config";

const { NODE_ENV } = config;

export default function logger(loggerName: string, skipContext: any) {
  const logLevelObj = {
    testing: "fatal",
    production: "info",
  };

  // type LogLevelString = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  let bunyanConfig: LoggerOptions = {
    name: loggerName,
    level: "trace",
  };

  let logger: any = bunyan.createLogger(bunyanConfig);

  let constructLogObj = (level: string) => {
    return (...args: any) => {
      try {
        if (!skipContext) {
          logger[level](...args);
        } else {
          //no-args
        }
      } catch (e) {
        logger.error("error in apiHash");
        logger.error(e);
        logger[level](...args);
      }
    };
  };

  let logObj = {
    info: constructLogObj("info"),
    trace: constructLogObj("trace"),
    debug: constructLogObj("debug"),
    warn: constructLogObj("warn"),
    error: constructLogObj("error"),
    fatal: constructLogObj("fatal"),
  };

  return logObj;
}

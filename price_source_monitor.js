const near = require("./near");
const config = require("./config");
const coingecko = require("./feeds/coingecko");
const binance = require("./feeds/binance");
const binanceFutures = require("./feeds/binance-futures");
const huobi = require("./feeds/huobi");
const cryptocom = require("./feeds/crypto.com");
const kucoin = require("./feeds/kucoin");
const gate = require("./feeds/gate");
const chainlink = require("./feeds/chainlink");
const refExchange = require("./feeds/refExchange");
const { LoadJson, SaveJson } = require("./functions");
const pjson = require('./package.json');
const moment = require('moment');

const nearConfig = config.getConfig(process.env.NODE_ENV || "development");

const TestnetCoins = {
    "wrap.testnet": {
        decimals: 24,
        coingecko: "near",
        binance: "NEARUSDT",
        huobi: "nearusdt",
        cryptocom: "NEAR_USDT",
        kucoin: "NEAR-USDT",
        gate: "near_usdt",
        chainlink: "0xC12A6d1D827e23318266Ef16Ba6F397F2F91dA9b",
        fluctuationRatio: 10
    },
    aurora: {
        decimals: 18,
        coingecko: "ethereum",
        binance: "ETHUSDT",
        huobi: "ethusdt",
        cryptocom: "ETH_USDT",
        kucoin: "ETH-USDT",
        gate: "eth_usdt",
        chainlink: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        fractionDigits: 2,
        fluctuationRatio: 10
    },
    "usdt.fakes.testnet": {
        decimals: 6,
        stablecoin: true,
        coingecko: "tether",
        gate: "usdt_usd",
        chainlink: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
        fluctuationRatio: 10
    },
    "usdc.fakes.testnet": {
        decimals: 6,
        stablecoin: true,
        coingecko: "usd-coin",
        cryptocom: "USDC_USDT",
        kucoin: "USDC-USDT",
        binance: "USDCUSDT",
        chainlink: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        fluctuationRatio: 10
    },
    "dai.fakes.testnet": {
        decimals: 18,
        stablecoin: true,
        coingecko: "dai",
        huobi: "daiusdt",
        cryptocom: "DAI_USDT",
        gate: "dai_usdt",
        binance: "DAIUSDT",
        chainlink: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        fluctuationRatio: 10
    },
    "wbtc.fakes.testnet": {
        decimals: 8,
        coingecko: "wrapped-bitcoin",
        binance: "BTCUSDT",
        huobi: "btcusdt",
        cryptocom: "BTC_USDT",
        kucoin: "BTC-USDT",
        gate: "btc_usdt",
        chainlink: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        fractionDigits: 2,
        fluctuationRatio: 10
    },
    "aurora.fakes.testnet": {
        decimals: 18,
        coingecko: "aurora-near",
        cryptocom: "AURORA_USDT",
        huobi: "aurorausdt",
        kucoin: "AURORA-USDT",
        gate: "aurora_usdt",
        relativeDiff: 0.01, // 1%
        fractionDigits: 5,
        fluctuationRatio: 10
    },
    "woo.orderly.testnet": {
        decimals: 18,
        coingecko: "woo-network",
        binance: "WOOUSDT",
        huobi: "woousdt",
        cryptocom: "WOO_USDT",
        kucoin: "WOO-USDT",
        gate: "woo_usdt",
        relativeDiff: 0.01, // 1%
        fractionDigits: 6,
        fluctuationRatio: 10
    }
};

const MainnetCoins = {
    "wrap.near": {
        decimals: 24,
        coingecko: "near",
        binance: "NEARUSDT",
        huobi: "nearusdt",
        cryptocom: "NEAR_USDT",
        kucoin: "NEAR-USDT",
        gate: "near_usdt",
        chainlink: "0xC12A6d1D827e23318266Ef16Ba6F397F2F91dA9b",
        fluctuationRatio: 10
    },
    aurora: {
        decimals: 18,
        coingecko: "ethereum",
        binance: "ETHUSDT",
        huobi: "ethusdt",
        cryptocom: "ETH_USDT",
        kucoin: "ETH-USDT",
        gate: "eth_usdt",
        chainlink: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        fractionDigits: 2,
        fluctuationRatio: 10
    },
    "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": {
        decimals: 6,
        stablecoin: true,
        coingecko: "tether",
        // gate: "usdt_usd",
        chainlink: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
        fluctuationRatio: 10
    },
    "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": {
        decimals: 6,
        stablecoin: true,
        coingecko: "usd-coin",
        cryptocom: "USDC_USDT",
        kucoin: "USDC-USDT",
        binance: "USDCUSDT",
        chainlink: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        fluctuationRatio: 10
    },
    "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near": {
        decimals: 18,
        stablecoin: true,
        coingecko: "dai",
        huobi: "daiusdt",
        cryptocom: "DAI_USDT",
        gate: "dai_usdt",
        binance: "DAIUSDT",
        chainlink: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        fluctuationRatio: 10
    },
    "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near": {
        decimals: 8,
        coingecko: "wrapped-bitcoin",
        binance: "BTCUSDT",
        huobi: "btcusdt",
        cryptocom: "BTC_USDT",
        kucoin: "BTC-USDT",
        gate: "btc_usdt",
        chainlink: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        fractionDigits: 2,
        fluctuationRatio: 10
    },
    "aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near": {
        decimals: 18,
        coingecko: "aurora-near",
        cryptocom: "AURORA_USDT",
        huobi: "aurorausdt",
        kucoin: "AURORA-USDT",
        gate: "aurora_usdt",
        relativeDiff: 0.01, // 1%
        fractionDigits: 5,
        fluctuationRatio: 10
    },
    "4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near": {
        decimals: 18,
        coingecko: "woo-network",
        binance: "WOOUSDT",
        huobi: "woousdt",
        cryptocom: "WOO_USDT",
        kucoin: "WOO-USDT",
        gate: "woo_usdt",
        relativeDiff: 0.01, // 1%
        fractionDigits: 6,
        fluctuationRatio: 10
    }
};

const mainnet = nearConfig.networkId === "mainnet";
const coins = mainnet ? MainnetCoins : TestnetCoins;

const SOURCES = ["binance", "coingecko", "binanceFutures", "huobi", "cryptocom", "kucoin", "gate", "chainlink"];

const SOURCE_INVALID = "SOURCE_INVALID";
const PRICE_ZERO = "PRICE_ZERO";
const PRICE_ANOMALY = "PRICE_ANOMALY";

const getSourceAlarmFilter = () => {
    return process.env.SOURCE_ALARM_FILTER == undefined ? [] : process.env.SOURCE_ALARM_FILTER.split(",")
}

const getPriceZeroAlarmFilter = () => {
    return process.env.PRICE_ZERO_ALARM_FILTER == undefined ? [] : process.env.PRICE_ZERO_ALARM_FILTER.split(",")
}

const getPriceAnomalyAlarmFilter = () => {
    return process.env.PRICE_ANOMALY_ALARM_FILTER == undefined ? [] : process.env.PRICE_ANOMALY_ALARM_FILTER.split(",")
}

const REPORTED_FILENAME = process.env.REPORTED_FILENAME || "./data/reported.json";

async function main() {

    try {
        const reportedAlarms = LoadJson(REPORTED_FILENAME) || [];

        const marketPrices = await Promise.all([
            binance.getPrices(coins),
            coingecko.getPrices(coins),
            binanceFutures.getPrices(coins),
            huobi.getPrices(coins),
            cryptocom.getPrices(coins),
            kucoin.getPrices(coins),
            gate.getPrices(coins),
            chainlink.getPrices(coins),
        ]);

        let coinPriceInfos = Object.keys(coins).reduce((coinPriceInfos, coinAccountId) => {
            let coinInfo = Object.keys(coins[coinAccountId]).reduce((coinPrices, coinPropertyKey) => {
                const sourceIndex = SOURCES.indexOf(coinPropertyKey);
                if (sourceIndex != -1) {
                    coinPrices[SOURCES[sourceIndex]] = marketPrices[sourceIndex] ? marketPrices[sourceIndex][coinAccountId] : null;
                    if (SOURCES[sourceIndex] == "binance") {
                        const binanceFuturesIndex = SOURCES.indexOf("binanceFutures");
                        coinPrices["binanceFutures"] = marketPrices[binanceFuturesIndex] ? marketPrices[binanceFuturesIndex][coinAccountId] : null;
                    }
                }
                return coinPrices;
            }, {});
            coinPriceInfos[coinAccountId] = coinInfo;
            return coinPriceInfos;
        }, {});

        if (config.PRINT_DEBUG) {
            console.log(JSON.stringify(coinPriceInfos, null, 2));
        }
        
        const priceSourceAlarms = CheckPriceSources(marketPrices);
        const priceZeroAlarms = CheckPriceZero(coinPriceInfos);
        const priceAnomalyAlarms = CheckPriceAnomaly(coins, coinPriceInfos);

        const allAlarms = [...priceSourceAlarms, ...priceZeroAlarms, ...priceAnomalyAlarms];

        const [toReport, toRecover, alarming] = Redistribute(allAlarms, reportedAlarms, coinPriceInfos);

        console.log(JSON.stringify({
            "toReport": toReport,
            "toRecover": toRecover,
            "alarming": alarming,
        }, null, 2))
        SaveJson(alarming, REPORTED_FILENAME);
        // TODO report toReport and toRecover
    } catch (e) {
        console.log(e)
        // TODO report error
    }
}

const Redistribute = (allAlarms, reportedAlarms, coinPriceInfos) => {
    let toReport = [];
    let toRecover = [];
    let alarming = [];

    reportedAlarms.forEach((reportedAlarm) => {
        const isReported = allAlarms.some((alarm) => {
            return reportedAlarm["alarmType"] == alarm["alarmType"] &&
                reportedAlarm["source"] == alarm["source"] &&
                reportedAlarm["coin"] == alarm["coin"]
        });

        if (isReported) {
            alarming.push(reportedAlarm)
        } else {
            const currentTime = moment();
            reportedAlarm["priceInfo"] = JSON.stringify(coinPriceInfos[reportedAlarm["coin"]]);
            reportedAlarm["endTime"] = currentTime;
            let duration = currentTime.diff(reportedAlarm["startTime"], "s");
            const seconds = duration % 60;
            const minutes = parseInt(duration % (60 * 60) / 60);
            const hours = parseInt(duration % (60 * 60 * 60) / (60 * 60));
            reportedAlarm["duration"] = hours.toString() + "::" + minutes.toString() + "::" + seconds.toString()
            toRecover.push(reportedAlarm)
        }
    });

    allAlarms.forEach((alarm) => {
        const isReported = reportedAlarms.some((reportedAlarm) => {
            return reportedAlarm["alarmType"] == alarm["alarmType"] &&
                reportedAlarm["source"] == alarm["source"] &&
                reportedAlarm["coin"] == alarm["coin"]
        });
        if (!isReported) {
            toReport.push(alarm)
            alarming.push(alarm)
        }
    });

    return [toReport, toRecover, alarming]
}

const CheckPriceSources = (values) => {
    let alarms = []
    let sourceAlarmFilter = getSourceAlarmFilter();
    values.forEach((value, index) => {
        if (value == undefined && sourceAlarmFilter.indexOf(SOURCES[index]) == -1) {
            alarms.push(AlarmInfo(SOURCE_INVALID, SOURCES[index], null, null));
        }
    })
    return alarms
}

const CheckPriceZero = (coinPriceInfos) => {
    let alarms = []
    let priceZeroAlarmFilter = getPriceZeroAlarmFilter();
    Object.entries(coinPriceInfos).forEach(([coinAccountId, priceInfo]) => {
        Object.keys(priceInfo).forEach((source) => {
            if (priceInfo[source] == 0 && priceZeroAlarmFilter.indexOf(source) == -1) {
                alarms.push(AlarmInfo(PRICE_ZERO, source, coinAccountId, JSON.stringify(priceInfo)));
            }
        });
    });
    return alarms
}

const CheckPriceAnomaly = (coins, coinPriceInfos) => {
    let alarms = []
    let priceAnomalyAlarmFilter = getPriceAnomalyAlarmFilter();
    Object.entries(coinPriceInfos).forEach(([coinAccountId, priceInfo]) => {
        if (coins[coinAccountId]["fluctuationRatio"] != undefined) {

            let prices = Object.entries(priceInfo).reduce((obj, [source, price]) => {
                if (price != null) {
                    obj.push([source, price])
                }
                return obj
            }, []);

            if (Object.keys(prices).length == 0) {
                alarms.push(AlarmInfo(PRICE_ANOMALY, null, coinAccountId, JSON.stringify(priceInfo)));
            } else {
                prices.sort((a, b) => a[1] - b[1]);
                let half = Math.floor(prices.length / 2);
                let report_price = prices.length % 2 == 0 ? (prices[half - 1][1] + prices[half][1]) / 2.0 : prices[half][1];

                let extraMsg = {
                    "reportPrice": report_price,
                    "normalPrice": {},
                    "anomalyPrice": {},
                }
                prices.forEach(([source, price]) => {
                    let diff = price > report_price ? price - report_price : report_price - price;
                    let fluctuationRatio = coins[coinAccountId]["fluctuationRatio"] / 100;
                    let isNormal = diff / report_price <= fluctuationRatio;
                    if (isNormal) {
                        extraMsg["normalPrice"][source] = price;
                    } else {
                        extraMsg["anomalyPrice"][source] = price;
                    }
                });

                const needReport = Object.keys(extraMsg["anomalyPrice"]).some((source) => {
                    return priceAnomalyAlarmFilter.indexOf(source) == -1;
                });
                if (Object.keys(extraMsg["anomalyPrice"]).length > 0 && needReport) {
                    alarms.push(AlarmInfo(PRICE_ANOMALY, null, coinAccountId, JSON.stringify(extraMsg)));
                }
            }
        }
    });
    return alarms
}

const AlarmInfo = (alarmType, source, coin, extraMsg) => {
    return {
        "alarmType": alarmType,
        "source": source,
        "coin": coin,
        "extraMsg": extraMsg,
        "startTime": moment()
    }
}

setTimeout(() => {
    process.exit(1);
}, config.REPORT_TIMEOUT);

main().then(() => {
    process.exit(0);
});

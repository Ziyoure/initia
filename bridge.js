const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { SigningStargateClient, coins } = require("@cosmjs/stargate");
const { MsgTransfer } = require("cosmjs-types/ibc/applications/transfer/v1/tx");
const { Height } = require("cosmjs-types/ibc/core/client/v1/client");
const { bcs } = require("@initia/initia.js");
const BigNumber = require("bignumber.js");
const fs = require("fs");

// 读取zhujici.txt 文件中的所有助记词
const mnemonics = fs.readFileSync("zhujici.txt", "utf-8")
  .split("\n")
  .map(mnemonic => mnemonic.trim())
  .filter(Boolean); // 过滤掉空行

async function getTaskInfo(mnemonic) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "init",
  });
  const [firstAccount] = await wallet.getAccounts();
  const url = `https://xp-api.initiation-1.initia.xyz/xp/weekly/${firstAccount.address}/5`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  return json;
}

class Bridge {
  constructor(
    mnemonic,
    rpcEndpoint,
    tokenAddress,
    tokenAmount,
    feeAddress,
    feeAmount,
    metadata,
    channelID
  ) {
    this.mnemonic = mnemonic;
    this.rpcEndpoint = rpcEndpoint;
    this.tokenAddress = tokenAddress;
    this.tokenAmount = tokenAmount;
    this.feeAddress = feeAddress;
    this.feeAmount = feeAmount;
    this.metadata = metadata;
    this.channelID = channelID;
  }
  async task() {
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
        prefix: "init",
      });
      const [firstAccount] = await wallet.getAccounts();
      console.log("Your address:", firstAccount.address);
      const client = await SigningStargateClient.connectWithSigner(
        this.rpcEndpoint,
        wallet
      );
      const balance = await client.getBalance(
        firstAccount.address,
        this.tokenAddress
      ); // 替换 'uinit' 为你实际的代币单位
      console.log("Your balance:", balance);
      if (Number(balance.amount) < Number(this.tokenAmount)) {
        console.error("余额不足，无法继续执行任务");
        return;
      }
      const timeNow = BigNumber(Date.now())
        .plus(10 * 60 * 1e3)
        .times(1e6)
        .toString();

      const amountFinal = {
        denom: this.tokenAddress,
        amount: this.tokenAmount,
      };

      const timeoutHeight = Height.fromPartial({
        revisionNumber: 0,
        revisionHeight: 0,
      });
      const memo =
        '{"move":{"message":{"module_address":"0x1","module_name":"cosmos","function_name":"transfer","type_args":[],"args":["K2luaXQxanVjZ3JqNjVmcHBza25ycDJtZHh5emphbXQza3QwY2szNGZycnQ=","KYJNlS4DVJD651Z97qXxW1BKaPpzYQBjwWCrH6h91gk=","QEIPAAAAAAA=","CHRyYW5zZmVy","CWNoYW5uZWwtMA==","AAAAAAAAAAA=","AAAAAAAAAAA=","QGv3KZuO2Bc=","AA=="]}}}';
      let memoObj = JSON.parse(memo);
      memoObj.move.message.args = [
        bcs.string().serialize(firstAccount.address).toBase64(),
        bcs.address().serialize(this.metadata).toBase64(),
        bcs.u64().serialize(this.tokenAmount).toBase64(),
        bcs.string().serialize("transfer").toBase64(),
        bcs.string().serialize(this.channelID).toBase64(),
        bcs.u64().serialize("0").toBase64(),
        bcs.u64().serialize("0").toBase64(),
        bcs.u64().serialize(timeNow).toBase64(),
        bcs.string().serialize("").toBase64(),
      ];
      const newMemo = JSON.stringify(memoObj);

      const msgTransfer = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sourcePort: "transfer",
          sourceChannel: "channel-0",
          token: amountFinal,
          sender: firstAccount.address,
          receiver: "0x1::cosmos::transfer", // replace with recipient address
          timeoutHeight: timeoutHeight,
          timeoutTimestamp: timeNow,
          memo: newMemo,
        }),
      };
      const estimatedGas = await client.simulate(
        firstAccount.address,
        [msgTransfer],
        ""
      );
      const gasLimit = Math.floor(estimatedGas * 1.2); // 乘以一个调整因子

      const fee = {
        amount: coins(this.feeAmount, this.feeAddress),
        gas: gasLimit.toString(),
      };
      const tx = await client.signAndBroadcast(
        firstAccount.address,
        [msgTransfer],
        fee,
        ""
      );

      console.log("Tx successful:", tx);
    } catch (e) {
      console.log(e);
    }
  }
  async swapTransfer() {
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
        prefix: "init",
      });
      const [firstAccount] = await wallet.getAccounts();
      console.log("Your address:", firstAccount.address);
      const client = await SigningStargateClient.connectWithSigner(
        this.rpcEndpoint,
        wallet
      );
      const balance = await client.getBalance(
        firstAccount.address,
        this.tokenAddress
      ); // 替换 'uinit' 为你实际的代币单位
      console.log("Your balance:", balance);
      if (Number(balance.amount) < Number(this.tokenAmount)) {
        console.error("余额不足，无法继续执行任务");
        return;
      }
      let amount = 992000;

      const timeNow = BigNumber(Date.now())
        .plus(10 * 60 * 1e3)
        .times(1e6)
        .toString();

      const amountFinal = {
        denom: this.tokenAddress,
        amount: this.tokenAmount,
      };

      const timeoutHeight = Height.fromPartial({
        revisionNumber: 0,
        revisionHeight: 0,
      });
      const memo =
        '{"move":{"message":{"module_address":"0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a","module_name":"swap_transfer","function_name":"minit_swap_deposit","type_args":[],"args":["2+lWb+7Xy+Fy4RJ3INn8xwr0QQlVvARSifYjl59C9Bc=","jkczvavPfUr8PRTw3UbJv1L7D86eS5lsk54ZW4vIkdk=","QEIPAAAAAAA=","AcEjDwAAAAAA","DgAAAAAAAAA=","AAAAAAAAAAAAAAAAlzCBy1RIQwtMYVbaYgpd2uNlvxY=","AA=="]}}}';
      let memoObj = JSON.parse(memo);
      memoObj.move.message.args = [
        bcs.address().serialize(this.metadata).toBase64(),
        bcs
          .address()
          .serialize(
            "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9"
          )
          .toBase64(),
        bcs.u64().serialize(this.tokenAmount).toBase64(),
        bcs.option(bcs.u64()).serialize(amount).toBase64(),
        bcs.u64().serialize(this.channelID).toBase64(),
        bcs.address().serialize(firstAccount.address).toBase64(),
        bcs.vector(bcs.u8()).serialize([]).toBase64(),
      ];
      const newMemo = JSON.stringify(memoObj);

      const msgTransfer = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sourcePort: "transfer",
          sourceChannel: "channel-0",
          token: amountFinal,
          sender: firstAccount.address,
          receiver:
            "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a::swap_transfer::minit_swap_deposit", // replace with recipient address
          timeoutHeight: timeoutHeight,
          timeoutTimestamp: timeNow,
          memo: newMemo,
        }),
      };
      const estimatedGas = await client.simulate(
        firstAccount.address,
        [msgTransfer],
        ""
      );
      const gasLimit = Math.floor(estimatedGas * 1.2); // 乘以一个调整因子
      const fee = {
        amount: coins(this.feeAmount, this.feeAddress),
        gas: gasLimit.toString(),
      };
      const tx = await client.signAndBroadcast(
        firstAccount.address,
        [msgTransfer],
        fee,
        ""
      );

      console.log("Tx successful:", tx);
    } catch (e) {
      console.log(e);
    }
  }
}

async function main() {
  const taskFinished = [
    "cross_transfer_blackwing_minimove",
    "cross_transfer_civitia_initai",
    "cross_transfer_initai_tucana",
    "cross_transfer_lunch_miniwasm",
    "cross_transfer_minimove_blackwing",
    "cross_transfer_tucana_lunch",
  ];

  // 定义任务函数
  const tasks = {
    cross_transfer_blackwing_minimove: async (mnemonic) => {
      //task1
      console.log(
        "=================task1: Send 1 USDC from Blackwing to Minimove"
      );
      const task1 = new Bridge(
        mnemonic,
        "https://maze-rpc-18bdff44-3aa4-425e-9bc0-06a2afa40af8.ue1-prod.newmetric.xyz",
        "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
        "1000000",
        "l2/aee375e9d0b181f0d9d3a49f9a3d1d6b05d62b0ac81f8c92b9282afa4213d884",
        "90000",
        "0x29824d952e035490fae7567deea5f15b504a68fa73610063c160ab1fa87dd609",
        "channel-0"
      );
      await task1.task();
    },
    cross_transfer_initai_tucana: async (mnemonic) => {
      //task2
      console.log(
        "=================task2: Sent 1 INIT from Init AI to Tucana"
      );
      const task2 = new Bridge(
        mnemonic,
        "https://maze-rpc-617bacff-7d34-4eb8-87f4-ee16fb4e0ac7.ue1-prod.newmetric.xyz",
        "l2/aadf1a9da6a38b7e7e11839364ee42002260eff1657f403b9ce608337bcb986b",
        "1000000",
        "l2/aadf1a9da6a38b7e7e11839364ee42002260eff1657f403b9ce608337bcb986b",
        "90000",
        "0xdbe9566feed7cbe172e1127720d9fcc70af4410955bc045289f623979f42f417",
        "14"
      );
      await task2.swapTransfer();
    },
    cross_transfer_lunch_miniwasm: async (mnemonic) => {
      //task3
      console.log(
        "=================task3: Sent 0.1 TIA from Noon to Miniwasm"
      );
      const task3 = new Bridge(
        mnemonic,
        "https://burrito-1-rpc.lunchlunch.xyz/",
        "ibc/C3E53D20BC7A4CC993B17C7971F8ECD06A433C10B6A96F4C4C3714F0624C56DA",
        "100000",
        "l2/ffea49d63cbadcfd749b4f635eca198b2f3b44cb1f6b580f5d201d58f3bf7aea",
        "90000",
        "0xacceb3b245392afe08346b794cf5c4ff85e7e9a8c82fcaf5112ae9d64ba57ccb",
        "channel-2"
      );
      await task3.task();
    },
    cross_transfer_minimove_blackwing: async (mnemonic) => {
      //task4
      console.log(
        "=================task4: Send 0.0001 ETH from Minimove to Blackwing"
      );
      const task4 = new Bridge(
        mnemonic,
        "https://rpc.minimove-1.initia.xyz",
        "ibc/0E98D4D1D907597448FD3A7C33DDAE10A90FA86FC8A9F5A0B175393783F249CD",
        "100",
        "l2/771d639f30fbe45e3fbca954ffbe2fcc26f915f5513c67a4a2d0bc1d635bdefd",
        "90000",
        "0xbe0ef849e425ca89830c1ff0f984f5b0b512b70cab6a5ae294c6255c3ee4cd0c",
        "channel-13"
      );
      await task4.task();
    },
    cross_transfer_civitia_initai: async (mnemonic) => {
      //task5
      console.log(
        "=================task5: Send 1 INIT from Civitia to INIT AI"
      );
      const task5 = new Bridge(
        mnemonic,
        "https://maze-rpc-sequencer-beab9b6f-d96d-435e-9caf-5679296d8172.ue1-prod.newmetric.xyz",
        "l2/afaa3f4e1717c75712f8e8073e41f051a4e516cd25daa82d948c4729388edefd",
        "1000000",
        "l2/afaa3f4e1717c75712f8e8073e41f051a4e516cd25daa82d948c4729388edefd",
        "90000",
        "0x2639d83f4ff3c79f7ffa380d903c60697b4c32c9cafa8fdde2f1f727210b9524",
        "6"
      );
      await task5.swapTransfer();
    },
    cross_transfer_tucana_lunch: async (mnemonic) => {
      //task6
      console.log("=================task6: Send 1 USDC from Tucana to Noon");
      const task6 = new Bridge(
        mnemonic,
        "https://maze-rpc-c9796789-107d-49ab-b6de-059724d2a91d.ue1-prod.newmetric.xyz",
        "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
        "1000000",
        "utuc",
        "0",
        "0xbe0ef849e425ca89830c1ff0f984f5b0b512b70cab6a5ae294c6255c3ee4cd0c",
        "channel-31"
      );
      await task6.task();
    },
  };

  async function executeTasks(tasks, diff, mnemonic) {
    for (const taskName of diff) {
      if (tasks[taskName]) {
        await tasks[taskName](mnemonic);
      } else {
        console.log(`No task defined for ${taskName}`);
      }
    }
  }

  for (const mnemonic of mnemonics) {
    try {
      const response = await getTaskInfo(mnemonic);
      console.log("已完成Task任务数: ", response.finished_tasks.length);
      const diff = taskFinished.filter(
        (item) => !response.finished_tasks.includes(item)
      );
      console.log("diff: ", diff);
      await executeTasks(tasks, diff, mnemonic);
    } catch (e) {
      console.log(e);
    }
  }
}

main().catch(console.error);

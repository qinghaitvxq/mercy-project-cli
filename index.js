#!/usr/bin/env node
const program = require("commander");
const inquirer = require("inquirer");
const package = require("./package.json");
const download = require("download-git-repo");
const path = require("path");
const rimraf = require("rimraf");
const handlebars = require("handlebars");
const fs = require("fs");
const chalk = require("chalk");
const ora = require("ora");
const settings = require("./repo-settings.json");

const spinner = ora("正在创建项目工程文件夹, 请稍后...");
const repoUrl = settings.original;

program
  .command("init")
  .description("init a project")
  .action((name, opts) => {
    inquirer
      .prompt([
        {
          name: "type",
          type: "list",
          message: "请选择项目类型",
          choices: ["react", "H5"],
          default: "react",
        },
        {
          name: "name",
          message: "请输入项目名称（默认以此创建文件夹）",
          default: "project",
        },
        {
          name: "description",
          message: "请输入项目描述",
          default: "description",
        },
        { name: "author", message: "请输入项目作者", default: "robot" },
      ])
      .then((param) => {
        const { type, name, description, author } = param;
        const downloadPath = path.join(process.cwd(), name);
        rimraf.sync(downloadPath, {});
        spinner.start();
        download(repoUrl, downloadPath, { clone: true }, function (err) {
          spinner.succeed();
          const packagePath = path.join(downloadPath, "package.json");
          console.log("--check repoUrl Path---", repoUrl);
          console.log("--check Packag Path---", packagePath);
          // 判断是否有package.json, 要把输入的数据回填到模板中
          if (fs.existsSync(packagePath)) {
            const content = fs.readFileSync(packagePath).toString();
            // handlebars 模板处理引擎
            const template = handlebars.compile(content);
            const result = template(param);
            fs.writeFileSync(packagePath, result);
            console.log(chalk.green("success! 项目初始化成功！"));
            console.log(
              chalk.greenBright("开启项目") +
                "\n" +
                chalk.greenBright("cd " + name) +
                "\n" +
                chalk.greenBright("start to dvelop~~~!")
            );
          } else {
            spinner.fail();
            console.log(chalk.red("failed! no package.json"));
            return;
          }
          console.log(err ? "出错" : "项目创建成功!");
        });
      });
  });

program.parse(process.argv);

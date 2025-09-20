## PreInstallation

* ابتدا باید کتابخانه curl را برای انتقال داده نصب کنیم

```shell
sudo apt install -y curl software-properties-common
```
*  بعد از آن باید مخزن NodeSource را مطابق ورژن مورد نیاز اضافه کنیم (این کد آخرین ورژن LTS را اضافه میکند)

```shell
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```

* سپس باید ماژول مدیریت بسته های `Node.js` و `NPM` را نصب نماییم

```shell
sudo apt install -y nodejs
```

## Installation

* در این مرحله ابتدا باید dependencies های پروژه را نصب نمایم

```shell
npm i
```
* و سپس پروژه را شروع میکنیم

```shell
npm run dev -- --host --port 5173
```

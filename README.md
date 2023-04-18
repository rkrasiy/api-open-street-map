# Usage

```bash
npm install
```

And then run:

```bash
npm run start
```


# Step 1 — Initializing the Project

To get started, create a new folder named node_project and move into that directory:

```bash
mkdir api-open-street-map
cd api-open-street-map
```

Next, initilizae it as an npm project:

```bash
npm init -y
```
The -y flag tells npm init to automatically say “yes” to the defaults. You can always update this information later in your package.json file.


# Step 2 — Configuring the TypeScript Compiler

Now that your npm project is initialized, you are ready to install and set up TypeScript.

Run the following command from inside your project directory to install the TypeScript:

```bash
npm install --save-dev typescript
```

```bash
Output
added 1 package, and audited 2 packages in 1s

found 0 vulnerabilities
```

TypeScript uses a file called tsconfig.json to configure the compiler options for a project. Create a tsconfig.json file in the root of the project directory:

```bash
nano tsconfig.json
```
Then paste in the following JSON:

```bash
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist"
  },
  "lib": ["es2015"]
}
```

Let’s go over some of the keys in the JSON snippet above:

    module: Specifies the module code generation method. Node uses commonjs.
    target: Specifies the output language level.
    moduleResolution: This helps the compiler figure out what an import refers to. The value node mimics the Node module resolution mechanism.
    outDir: This is the location to output .js files after transpilation. In this tutorial you will save it as dist.

To learn more about the key value options available, the official [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) offers explanations of every option.

# Step 3 - Creating a Minimal TypeScript Express Server

Now, it is time to install the [Express](https://expressjs.com/) framework and create a minimal server:

```bash
npm install --save express@4.17.1
npm install -save-dev @types/express@4.17.1
```

The second command installs the Express types for TypeScript support. Types in TypeScript are files, normally with an extension of .d.ts. The files are used to provide type information about an API, in this case the Express framework.

This package is required because TypeScript and Express are independent packages. Without the @types/express package, there is no way for TypeScript to know about the types of Express classes.

Next, create a src folder in the root of your project directory:

```bash
mkdir src
```
Then create a TypeScript file named app.ts within it:

```bash
nano src/app.ts
```
Open up the app.ts file with a text editor of your choice and paste in the following code snippet:

```bash
import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
```

The code above creates Node Server that listens on the port 3000 for requests. To run the app, you first need to compile it to JavaScript using the following command:

```bash
npx tsc
```

This uses the configuration file we created in the previous step to determine how to compile the code and where to place the result. In our case, the JavaScript is output to the dist directory.

Run the JavaScript output with node:

```bash
node dist/app.js
```
If it runs successfully, a message will be logged to the terminal:

```bash
Output
Express is listening at http://localhost:3000
```

Now, you can visit [http://localhost:3000](http://localhost:3000) in your browser and you should see the message:

```bash
Output
Hello World!
```
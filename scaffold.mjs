import fs from "node:fs";

const modules = {
  auth: "auth",
  users: "users",
  invitations: "invitations",
  guests: "master-guests",
  wishes: "wishes",
  templates: "invitation-templates",
  pages: "pages",
  products: "products",
  settings: "public/settings",
};

const pascal = (s) => s[0].toUpperCase() + s.slice(1);

for (const [name, route] of Object.entries(modules)) {
  const P = pascal(name);
  const dir = `src/${name}`;
  fs.mkdirSync(dir, { recursive: true });
  const write = (file, content) => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, content);
  };

  write(`${dir}/${name}.service.ts`,
`import { Injectable } from '@nestjs/common';

@Injectable()
export class ${P}Service {}
`);

  write(`${dir}/${name}.controller.ts`,
`import { Controller } from '@nestjs/common';
import { ${P}Service } from './${name}.service';

@Controller('${route}')
export class ${P}Controller {
  constructor(private readonly ${name}Service: ${P}Service) {}
}
`);

  write(`${dir}/${name}.module.ts`,
`import { Module } from '@nestjs/common';
import { ${P}Controller } from './${name}.controller';
import { ${P}Service } from './${name}.service';

@Module({
  controllers: [${P}Controller],
  providers: [${P}Service],
  exports: [${P}Service],
})
export class ${P}Module {}
`);
}

console.log("Done:", Object.keys(modules).join(", "));
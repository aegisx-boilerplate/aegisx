#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

const boilerplatePkgPath = path.resolve(__dirname, '../package.json');
const userPkgPath = path.resolve(process.cwd(), 'package.json');

if (!fs.existsSync(boilerplatePkgPath) || !fs.existsSync(userPkgPath)) {
  console.error('package.json not found.');
  process.exit(1);
}

const boilerplatePkg = JSON.parse(fs.readFileSync(boilerplatePkgPath, 'utf-8'));
const userPkg = JSON.parse(fs.readFileSync(userPkgPath, 'utf-8'));

userPkg.dependencies = { ...boilerplatePkg.dependencies };
userPkg.devDependencies = { ...boilerplatePkg.devDependencies };

fs.writeFileSync(userPkgPath, JSON.stringify(userPkg, null, 2));
console.log('Dependencies updated from boilerplate. Run npm install to apply changes.');
// Script: update-deps.ts
// Usage: npx ts-node scripts/update-deps.ts

console.log('Dependency updater script placeholder');

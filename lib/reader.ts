// Copyright 2020-2021 the AloeDB authors. All rights reserved. MIT license.

import { isUndefined, getPathDirname } from './utils';
import { lstatSync, Stats, mkdirSync, readFileSync, writeFileSync } from "fs";
import { readFile, lstat, writeFile, mkdir } from "fs/promises"

/**
 * Database storage file reader.
 */
export class Reader {

	/**
	 * Read database storage file. Creates a new file if its not exists.
	 * @param path Path to the file.
	 * @returns File content.
	 */
	public static async read(path: string): Promise<string> {
		if (isUndefined(path)) return '[]';

		if (await exists(path) === false) {
			await ensureFile(path, '[]');
			return '[]';
		}

		const content: string = await readFile(path, 'utf8');
		return content;
	}

	/**
	 * Read database storage file synchronously. Creates a new file if its not exists.
	 * @param path Path to the file.
	 * @returns File content.
	 */
	public static readSync(path: string): string {
		if (isUndefined(path)) return '[]';

		if (existsSync(path) === false) {
			ensureFileSync(path, '[]');
			return '[]';
		}

		const content: string = readFileSync(path, 'utf8');
		return content;
	}
}

/**
 * Test whether or not the given path exists.
 * @param path Path to the file.
 * @returns Is file exists.
 */
async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
		throw error;
	}
}

/**
 * Synchronously test whether or not the given path exists.
 * @param path Path to the file.
 * @returns Is file exists.
 */
function existsSync(path: string): boolean {
	try {
		lstatSync(path);
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
		throw error;
	}
}

/**
 * Ensures that the file exists.
 * @param path Path to the file.
 * @param data Data to write to if file not exists.
 * @returns Is file created.
 */
async function ensureFile(path: string, data: string = ''): Promise<void> {
	try {
		const info = await lstat(path);
		if (!info.isFile) throw new Error('Invalid file specified');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			const dirname: string = getPathDirname(path);
			await ensureDir(dirname);
			await writeFile(path, data, 'utf8');
			return;
		}

		throw error;
	}
}

/**
 * Ensures that the file exists synchronously.
 * @param path Path to the file.
 * @param data Data to write to if file not exists.
 * @returns Is file created.
 */
function ensureFileSync(path: string, data: string = ''): void {
	try {
		const info = lstatSync(path);
		if (!info.isFile) throw new Error('Invalid file specified');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			const dirname: string = getPathDirname(path);
			ensureDirSync(dirname);
			writeFileSync(path, data, 'utf8');
			return;
		}

		throw error;
	}
}

/**
 * Ensures that the file directory.
 * @param path Path to the directory.
 * @returns Is directory created.
 */
async function ensureDir(path: string): Promise<void> {
	try {
		const info: Stats = await lstat(path);
		if (!info.isDirectory) throw new Error('Invalid directory specified');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			await mkdir(path, { recursive: true });
			return;
		}

		throw error;
	}
}

/**
 * Ensures that the file directory synchronously.
 * @param path Path to the directory.
 * @returns Is directory created.
 */
function ensureDirSync(path: string): void {
	try {
		const info: Stats = lstatSync(path);
		if (!info.isDirectory) throw new Error('Invalid directory specified');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			mkdirSync(path, { recursive: true });
			return;
		}

		throw error;
	}
}

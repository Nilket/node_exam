import { writable } from "svelte/store";
import { fetchGet } from '../util/fetchUtil.js';

export const user = writable(null);
export const authorized = writable(false);

export async function checkAuth() {
    try{
        const data = await fetchGet('/auth/me');
        user.set(data?.user ?? null);
    } catch {
        user.set(null);
    } finally {
        authorized.set(true);
    }
}
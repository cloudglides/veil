export async function getPermissionsEntropy(): Promise<string> {
  const perms = [];
  const checks = ["geolocation", "notifications", "camera", "microphone"];

  for (const perm of checks) {
    try {
      const result = await navigator.permissions.query({ name: perm as any });
      perms.push(`${perm}:${result.state}`);
    } catch {
      perms.push(`${perm}:unknown`);
    }
  }

  return perms.join("|");
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getCompanions() {
  try {
    const response = await fetch(`${API_URL}/api/v1/companions`, {
      cache: 'no-store', // Ensure fresh data, or use 'force-cache' / 'next: { revalidate: ... }' as needed
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companions');
    }

    const data = await response.json();
    return data.companions || [];
  } catch (error) {
    console.error("Error fetching companions:", error);
    // Return null or empty array depending on how we want to handle it in the UI
    // The plan says to show "Network issues on the server", so re-throwing or returning null might be best to trigger that state.
    // For now, let's throw so the page can catch it or we handle it there.
    throw error;
  }
}

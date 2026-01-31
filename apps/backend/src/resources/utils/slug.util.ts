/**
 * Slug Utility
 *
 * WHAT: Converts strings to URL-friendly slugs
 * WHY: Clean URLs for resources (/resources/meeting-room-a)
 *
 * HOW:
 * 1. Convert to lowercase
 * 2. Replace spaces/special chars with hyphens
 * 3. Remove duplicate hyphens
 * 4. Trim hyphens from ends
 */
export class SlugUtil {
  /**
   * Generate slug from string
   *
   * EXAMPLES:
   * "Meeting Room A" → "meeting-room-a"
   * "Conference Room 101" → "conference-room-101"
   * "Equipment - Camera" → "equipment-camera"
   */
  static generate(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate unique slug by appending number if needed
   *
   * WHY: If "meeting-room" exists, create "meeting-room-2"
   *
   * HOW:
   * 1. Generate base slug
   * 2. Check if exists in database
   * 3. If exists, append "-2", "-3", etc.
   */
  static async generateUnique(
    text: string,
    checkExists: (slug: string) => Promise<boolean>
  ): Promise<string> {
    const baseSlug = this.generate(text);
    let slug = baseSlug;
    let counter = 1;

    // Keep incrementing until we find a unique slug
    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

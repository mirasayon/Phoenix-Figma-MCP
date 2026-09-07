import { defineConfig } from "repomix";
export default defineConfig({
  output: {
    filePath: "./repomix-output.xml",
    style: "xml",
    parsableStyle: false,
    compress: false,
    fileSummary: true,
    directoryStructure: true,
    includeFullDirectoryStructure: true,
    topFilesLength: 15,
    git: {
      sortByChanges: true,
      sortByChangesMaxCommits: 100,
      includeDiffs: false,
      includeLogs: false,
    },
  },

  include: ["./**"],
  ignore: {
    useGitignore: false,
    useDotIgnore: true,
    useDefaultPatterns: false,
    customPatterns: [
      "./repomix-output.xml",
      "node_modules/**",
      "./.git",
      "./dist/**",
      "./build/**",
      "*.tsbuildinfo",
    ],
  },
  security: {
    enableSecurityCheck: true,
  },
});

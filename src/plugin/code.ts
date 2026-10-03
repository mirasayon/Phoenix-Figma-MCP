/// <reference types="@figma/plugin-typings" />

// This is the main code file for the Phoenix Figma MCP plugin
// It handles Figma API commands

// Plugin state
const state = {
  serverPort: 3055, // Default port
  channel: "phoenix-figma",
};

type RestColor = { r: number; g: number; b: number; a?: number };
type RestGradientStop = Record<string, unknown> & {
  color?: RestColor;
  boundVariables?: unknown;
};
type RestPaint = Record<string, unknown> & {
  color?: RestColor;
  gradientStops?: RestGradientStop[];
  boundVariables?: unknown;
  imageRef?: unknown;
};
type RestNode = Record<string, unknown> & {
  id?: string;
  name?: string;
  type?: string;
  fills?: RestPaint[];
  strokes?: RestPaint[];
  cornerRadius?: unknown;
  absoluteBoundingBox?: unknown;
  characters?: string;
  style?: Record<string, unknown>;
  children?: RestNode[];
};

type FigmaRestExportResponse = {
  document: RestNode;
};

type NumericInput = number | string;
type RgbaInput = {
  r: NumericInput;
  g: NumericInput;
  b: NumericInput;
  a?: NumericInput;
};

type PluginSettings = {
  serverPort?: number;
  channel?: string;
};

type CommandName =
  | "get_document_info"
  | "get_selection"
  | "get_node_info"
  | "get_nodes_info"
  | "read_my_design"
  | "create_rectangle"
  | "create_frame"
  | "create_text"
  | "set_fill_color"
  | "set_stroke_color"
  | "move_node"
  | "resize_node"
  | "delete_node"
  | "delete_multiple_nodes"
  | "get_styles"
  | "get_local_components"
  | "create_component_instance"
  | "export_node_as_image"
  | "set_corner_radius"
  | "set_text_content"
  | "clone_node"
  | "scan_text_nodes"
  | "set_multiple_text_contents"
  | "get_annotations"
  | "set_annotation"
  | "scan_nodes_by_types"
  | "set_multiple_annotations"
  | "get_instance_overrides"
  | "set_instance_overrides"
  | "set_layout_mode"
  | "set_padding"
  | "set_axis_align"
  | "set_layout_sizing"
  | "set_item_spacing"
  | "get_reactions"
  | "set_default_connector"
  | "create_connections"
  | "set_focus"
  | "set_selections";

type PluginUiMessage =
  | ({ type: "update-settings" } & PluginSettings)
  | { type: "notify"; message: string }
  | { type: "close-plugin" }
  | {
      type: "execute-command";
      id: string;
      command: CommandName;
      params?: unknown;
    };

type NodeIdParams = { nodeId?: string };
type NodeIdsParams = { nodeIds?: string[]; commandId?: string };
type CreateRectangleParams = NodeIdParams & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  parentId?: string;
};
type CreateFrameParams = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  parentId?: string;
  fillColor?: RgbaInput;
  strokeColor?: RgbaInput;
  strokeWeight?: number;
  layoutMode?: FrameNode["layoutMode"];
  layoutWrap?: FrameNode["layoutWrap"];
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  primaryAxisAlignItems?: FrameNode["primaryAxisAlignItems"];
  counterAxisAlignItems?: FrameNode["counterAxisAlignItems"];
  layoutSizingHorizontal?: FrameNode["layoutSizingHorizontal"];
  layoutSizingVertical?: FrameNode["layoutSizingVertical"];
  itemSpacing?: number;
};
type CreateTextParams = {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: NumericInput;
  fontWeight?: number;
  fontColor?: RgbaInput;
  name?: string;
  parentId?: string;
  fontFamily?: string;
  fontStyle?: string;
  textAlignHorizontal?: TextNode["textAlignHorizontal"];
  width?: number;
  height?: number;
  textAutoResize?: TextNode["textAutoResize"];
  lineHeight?: NumericInput;
};
type SetFillColorParams = { nodeId?: string; color?: RgbaInput };
type SetStrokeColorParams = { nodeId?: string; color?: RgbaInput; weight?: number };
type MoveNodeParams = { nodeId?: string; x?: number; y?: number };
type ResizeNodeParams = { nodeId?: string; width?: number; height?: number };
type GetLocalComponentsParams = { commandId?: string };
type CreateComponentInstanceParams = {
  componentKey?: string;
  componentId?: string;
  x?: number;
  y?: number;
  parentId?: string;
};
type ExportNodeAsImageParams = {
  nodeId?: string;
  format?: "PNG" | "JPG" | "SVG" | "PDF";
  scale?: number;
};
type SetCornerRadiusParams = { nodeId?: string; radius?: number; corners?: boolean[] };
type SetTextContentParams = { nodeId?: string; text?: string };
type SetCharactersOptions = {
  fallbackFont?: FontName;
  smartStrategy?: "prevail" | "strict" | "experimental";
};
type CloneNodeParams = {
  nodeId?: string;
  x?: number;
  y?: number;
  positionMode?: "parent" | "frame";
};
type ScanTextNodesParams = {
  nodeId?: string;
  useChunking?: boolean;
  chunkSize?: number;
  commandId?: string;
};
type TextReplacement = { nodeId?: string; text?: string };
type SetMultipleTextContentsParams = {
  nodeId?: string;
  text?: TextReplacement[];
  commandId?: string;
};
type GetAnnotationsParams = { nodeId?: string; includeCategories?: boolean };
type SetAnnotationParams = {
  nodeId?: string;
  annotationId?: string;
  labelMarkdown?: string;
  categoryId?: string;
  properties?: ReadonlyArray<AnnotationProperty>;
};
type AnnotationInput = {
  nodeId: string;
  labelMarkdown: string;
  categoryId?: string;
  properties?: ReadonlyArray<AnnotationProperty>;
};
type SetMultipleAnnotationsParams = { nodeId?: string; annotations?: AnnotationInput[] };
type ScanNodesByTypesParams = { nodeId?: string; types?: string[]; commandId?: string };
type LayoutModeParams = {
  nodeId?: string;
  layoutMode?: FrameNode["layoutMode"];
  layoutWrap?: FrameNode["layoutWrap"];
};
type PaddingParams = {
  nodeId?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
};
type AxisAlignParams = {
  nodeId?: string;
  primaryAxisAlignItems?: FrameNode["primaryAxisAlignItems"];
  counterAxisAlignItems?: FrameNode["counterAxisAlignItems"];
};
type LayoutSizingParams = {
  nodeId?: string;
  layoutSizingHorizontal?: FrameNode["layoutSizingHorizontal"];
  layoutSizingVertical?: FrameNode["layoutSizingVertical"];
};
type ItemSpacingParams = { nodeId?: string; itemSpacing?: number; counterAxisSpacing?: number };
type SetDefaultConnectorParams = { connectorId?: string };
type ConnectionSpec = { startNodeId: string; endNodeId: string; text?: string };
type CreateConnectionsParams = { connections?: ConnectionSpec[]; commandId?: string };
type SetFocusParams = { nodeId?: string };
type SetSelectionsParams = { nodeIds?: string[] };

type SafeTextNode = {
  id: string;
  name: string;
  type: "TEXT";
  characters: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
  depth: number;
};
type NodeProcessInfo = { node: BaseNode; parentPath: string[]; depth: number };
type MatchingNode = {
  id: string;
  name: string;
  type: string;
  bbox: { x: number; y: number; width: number; height: number };
};
type ReactionActionLike = { navigation?: string };
type ReactionLike = Record<string, unknown> & {
  action?: ReactionActionLike | null;
  actions?: ReadonlyArray<ReactionActionLike>;
};
type ReactionResult = {
  id: string;
  name: string;
  type: string;
  depth: number;
  hasReactions: true;
  reactions: ReadonlyArray<ReactionLike>;
  path: string;
};
type TextReplacementResult =
  | { success: true; nodeId: string; originalText: string; translatedText: string }
  | { success: false; nodeId: string; error: string };
type DeleteNodeResult =
  | { success: true; nodeId: string; nodeInfo: { id: string; name: string; type: string } }
  | { success: false; nodeId: string; error: string };
type AnnotationApplyResult =
  { success: true; nodeId: string } | { success: false; nodeId: string; error?: string };
type FontTreeEntry = { start: number; delimiter: string; family: string; style: string };
type InstanceOverride = InstanceNode["overrides"][number];
type SourceInstanceDataResult =
  | {
      success: true;
      sourceInstance: InstanceNode;
      mainComponent: ComponentNode;
      overrides: ReadonlyArray<InstanceOverride>;
    }
  | { success: false; message: string };
type TargetInstancesResult =
  | { success: true; message: string; targetInstances: InstanceNode[] }
  | { success: false; message: string };
type InstanceOverrideResult =
  | { success: true; instanceId: string; instanceName: string; appliedCount: number }
  | { success: false; instanceId: string; instanceName: string; message: string };

function toFiniteNumber(value: NumericInput | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

function asParams<T extends object>(params: unknown): T {
  return (params ?? {}) as T;
}

function isSceneNode(node: BaseNode | null): node is SceneNode {
  return node !== null && node.type !== "DOCUMENT" && node.type !== "PAGE";
}

function hasChildren(node: BaseNode): node is BaseNode & ChildrenMixin {
  return "children" in node;
}

function hasAnnotations(node: BaseNode): node is BaseNode & AnnotationsMixin {
  return "annotations" in node;
}

function isFontName(value: FontName | typeof figma.mixed): value is FontName {
  return value !== figma.mixed;
}

// Helper function for progress updates
async function sendProgressUpdate(
  commandId: string,
  commandType: string,
  status: string,
  progress: number,
  totalItems: number,
  processedItems: number,
  message: string,
  payload: Record<string, unknown> | null = null,
) {
  const update: Record<string, unknown> = {
    type: "command_progress",
    commandId,
    commandType,
    status,
    progress,
    totalItems,
    processedItems,
    message,
    timestamp: Date.now(),
  };

  // Add optional chunk information if present
  if (payload) {
    if (payload.currentChunk !== undefined && payload.totalChunks !== undefined) {
      update.currentChunk = payload.currentChunk;
      update.totalChunks = payload.totalChunks;
      update.chunkSize = payload.chunkSize;
    }
    update.payload = payload;
  }

  // Send to UI
  figma.ui.postMessage(update);
  console.log(`Progress update: ${status} - ${progress}% - ${message}`);

  // Yield so the Figma plugin sandbox flushes postMessage to ui.html
  // before the next iteration begins
  await new Promise((resolve) => setTimeout(resolve, 0));

  return update;
}

// Show UI
figma.showUI(__html__, { width: 380, height: 600, themeColors: true });

// Plugin commands from UI
figma.ui.onmessage = async (msg: PluginUiMessage) => {
  switch (msg.type) {
    case "update-settings":
      await updateSettings(msg);
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "close-plugin":
      figma.closePlugin();
      break;
    case "execute-command":
      // Execute commands received from UI (which gets them from WebSocket)
      try {
        const result = await handleCommand(msg.command, {
          ...asParams<Record<string, unknown>>(msg.params),
          commandId: msg.id,
        });
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: errorMessage(error) || "Error executing command",
        });
      }
      break;
  }
};

// Listen for plugin commands from menu
figma.on("run", async () => {
  await settingsReady;
  figma.ui.postMessage({ type: "auto-connect" });
});

// Update plugin settings
async function updateSettings(settings: PluginSettings) {
  if (
    typeof settings.serverPort === "number" &&
    Number.isInteger(settings.serverPort) &&
    settings.serverPort > 0 &&
    settings.serverPort <= 65535
  ) {
    state.serverPort = settings.serverPort;
  }
  if (typeof settings.channel === "string" && settings.channel.trim()) {
    state.channel = settings.channel.trim();
  }

  await figma.clientStorage.setAsync("settings", {
    serverPort: state.serverPort,
    channel: state.channel,
  });
}

// Handle commands from UI
async function handleCommand(command: CommandName, params: unknown) {
  switch (command) {
    case "get_document_info":
      return await getDocumentInfo();
    case "get_selection":
      return await getSelection();
    case "get_node_info": {
      const { nodeId } = asParams<NodeIdParams>(params);
      if (!nodeId) {
        throw new Error("Missing nodeId parameter");
      }
      return await getNodeInfo(nodeId);
    }
    case "get_nodes_info": {
      const { nodeIds } = asParams<NodeIdsParams>(params);
      if (!nodeIds || !Array.isArray(nodeIds)) {
        throw new Error("Missing or invalid nodeIds parameter");
      }
      return await getNodesInfo(nodeIds);
    }
    case "read_my_design":
      return await readMyDesign();
    case "create_rectangle":
      return await createRectangle(asParams<CreateRectangleParams>(params));
    case "create_frame":
      return await createFrame(asParams<CreateFrameParams>(params));
    case "create_text":
      return await createText(asParams<CreateTextParams>(params));
    case "set_fill_color":
      return await setFillColor(asParams<SetFillColorParams>(params));
    case "set_stroke_color":
      return await setStrokeColor(asParams<SetStrokeColorParams>(params));
    case "move_node":
      return await moveNode(asParams<MoveNodeParams>(params));
    case "resize_node":
      return await resizeNode(asParams<ResizeNodeParams>(params));
    case "delete_node":
      return await deleteNode(asParams<NodeIdParams>(params));
    case "delete_multiple_nodes":
      return await deleteMultipleNodes(asParams<NodeIdsParams>(params));
    case "get_styles":
      return await getStyles();
    case "get_local_components":
      return await getLocalComponents(asParams<GetLocalComponentsParams>(params));
    // case "get_team_components":
    //   return await getTeamComponents();
    case "create_component_instance":
      return await createComponentInstance(asParams<CreateComponentInstanceParams>(params));
    case "export_node_as_image":
      return await exportNodeAsImage(asParams<ExportNodeAsImageParams>(params));
    case "set_corner_radius":
      return await setCornerRadius(asParams<SetCornerRadiusParams>(params));
    case "set_text_content":
      return await setTextContent(asParams<SetTextContentParams>(params));
    case "clone_node":
      return await cloneNode(asParams<CloneNodeParams>(params));
    case "scan_text_nodes":
      return await scanTextNodes(asParams<ScanTextNodesParams>(params));
    case "set_multiple_text_contents":
      return await setMultipleTextContents(asParams<SetMultipleTextContentsParams>(params));
    case "get_annotations":
      return await getAnnotations(asParams<GetAnnotationsParams>(params));
    case "set_annotation":
      return await setAnnotation(asParams<SetAnnotationParams>(params));
    case "scan_nodes_by_types":
      return await scanNodesByTypes(asParams<ScanNodesByTypesParams>(params));
    case "set_multiple_annotations":
      return await setMultipleAnnotations(asParams<SetMultipleAnnotationsParams>(params));
    case "get_instance_overrides": {
      const { instanceNodeId } = asParams<{ instanceNodeId?: string }>(params);
      if (instanceNodeId) {
        const instanceNode = await figma.getNodeByIdAsync(instanceNodeId);
        if (!instanceNode) {
          throw new Error(`Instance node not found with ID: ${instanceNodeId}`);
        }
        return await getInstanceOverrides(instanceNode);
      }
      return await getInstanceOverrides();
    }

    case "set_instance_overrides": {
      const { targetNodeIds, sourceInstanceId } = asParams<{
        targetNodeIds?: string[];
        sourceInstanceId?: string;
      }>(params);
      if (!targetNodeIds || !Array.isArray(targetNodeIds)) {
        throw new Error("targetNodeIds must be an array");
      }

      const targetNodes = await getValidTargetInstances(targetNodeIds);
      if (!targetNodes.success) {
        figma.notify(targetNodes.message);
        return { success: false, message: targetNodes.message };
      }

      if (!sourceInstanceId) {
        throw new Error("Missing sourceInstanceId parameter");
      }

      const sourceInstanceData = await getSourceInstanceData(sourceInstanceId);
      if (!sourceInstanceData.success) {
        figma.notify(sourceInstanceData.message);
        return { success: false, message: sourceInstanceData.message };
      }
      return await setInstanceOverrides(targetNodes.targetInstances, sourceInstanceData);
    }
    case "set_layout_mode":
      return await setLayoutMode(asParams<LayoutModeParams>(params));
    case "set_padding":
      return await setPadding(asParams<PaddingParams>(params));
    case "set_axis_align":
      return await setAxisAlign(asParams<AxisAlignParams>(params));
    case "set_layout_sizing":
      return await setLayoutSizing(asParams<LayoutSizingParams>(params));
    case "set_item_spacing":
      return await setItemSpacing(asParams<ItemSpacingParams>(params));
    case "get_reactions": {
      const { nodeIds, commandId } = asParams<NodeIdsParams>(params);
      if (!nodeIds || !Array.isArray(nodeIds)) {
        throw new Error("Missing or invalid nodeIds parameter");
      }
      return await getReactions(nodeIds, commandId);
    }
    case "set_default_connector":
      return await setDefaultConnector(asParams<SetDefaultConnectorParams>(params));
    case "create_connections":
      return await createConnections(asParams<CreateConnectionsParams>(params));
    case "set_focus":
      return await setFocus(asParams<SetFocusParams>(params));
    case "set_selections":
      return await setSelections(asParams<SetSelectionsParams>(params));
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// Command implementations

async function getDocumentInfo() {
  await figma.currentPage.loadAsync();
  const page = figma.currentPage;
  return {
    name: page.name,
    id: page.id,
    type: page.type,
    children: page.children.map((node: SceneNode) => ({
      id: node.id,
      name: node.name,
      type: node.type,
    })),
    currentPage: {
      id: page.id,
      name: page.name,
      childCount: page.children.length,
    },
    pages: [
      {
        id: page.id,
        name: page.name,
        childCount: page.children.length,
      },
    ],
  };
}

async function getSelection() {
  return {
    selectionCount: figma.currentPage.selection.length,
    selection: figma.currentPage.selection.map((node: SceneNode) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible,
    })),
  };
}

function rgbaToHex(color: RestColor): string {
  var r = Math.round(color.r * 255);
  var g = Math.round(color.g * 255);
  var b = Math.round(color.b * 255);
  var a = color.a !== undefined ? Math.round(color.a * 255) : 255;

  if (a === 255) {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          return x.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  return (
    "#" +
    [r, g, b, a]
      .map((x) => {
        return x.toString(16).padStart(2, "0");
      })
      .join("")
  );
}

function serializeRestPaint(paint: RestPaint): Record<string, unknown> {
  const processed: Record<string, unknown> = { ...paint };
  delete processed.boundVariables;
  delete processed.imageRef;

  if (paint.gradientStops) {
    processed.gradientStops = paint.gradientStops.map((stop) => {
      const processedStop: Record<string, unknown> = { ...stop };
      if (stop.color) {
        processedStop.color = rgbaToHex(stop.color);
      }
      delete processedStop.boundVariables;
      return processedStop;
    });
  }

  if (paint.color) {
    processed.color = rgbaToHex(paint.color);
  }

  return processed;
}

function filterFigmaNode(node: RestNode): Record<string, unknown> | null {
  const filtered: Record<string, unknown> = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.fills?.length) {
    filtered.fills = node.fills.map(serializeRestPaint);
  }

  if (node.strokes?.length) {
    filtered.strokes = node.strokes.map(serializeRestPaint);
  }

  if (node.cornerRadius !== undefined) {
    filtered.cornerRadius = node.cornerRadius;
  }

  if (node.absoluteBoundingBox) {
    filtered.absoluteBoundingBox = node.absoluteBoundingBox;
  }

  if (node.characters) {
    filtered.characters = node.characters;
  }

  if (node.style) {
    filtered.style = {
      fontFamily: node.style.fontFamily,
      fontStyle: node.style.fontStyle,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textAlignHorizontal: node.style.textAlignHorizontal,
      letterSpacing: node.style.letterSpacing,
      lineHeightPx: node.style.lineHeightPx,
    };
  }

  if (node.children) {
    filtered.children = node.children.map(filterFigmaNode).filter((child) => child !== null);
  }

  return filtered;
}

async function getNodeInfo(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (node.type === "DOCUMENT") {
    throw new Error(`Document node cannot be exported: ${nodeId}`);
  }

  const response = (await node.exportAsync({
    format: "JSON_REST_V1",
  })) as FigmaRestExportResponse;

  return filterFigmaNode(response.document);
}

async function getNodesInfo(nodeIds: string[]) {
  try {
    // Load all nodes in parallel
    const nodes = await Promise.all(nodeIds.map((id) => figma.getNodeByIdAsync(id)));

    // Filter out any null values (nodes that weren't found)
    const validNodes = nodes.filter((node) => node !== null);

    // Export all valid nodes in parallel
    const responses = await Promise.all(
      validNodes.map(async (node) => {
        if (node.type === "DOCUMENT") {
          throw new Error(`Document node cannot be exported: ${node.id}`);
        }
        const response = (await node.exportAsync({
          format: "JSON_REST_V1",
        })) as FigmaRestExportResponse;
        return {
          nodeId: node.id,
          document: filterFigmaNode(response.document),
        };
      }),
    );

    return responses;
  } catch (error) {
    throw new Error(`Error getting nodes info: ${errorMessage(error)}`);
  }
}

async function getReactions(nodeIds: string[], commandId = generateCommandId()) {
  try {
    sendProgressUpdate(
      commandId,
      "get_reactions",
      "started",
      0,
      nodeIds.length,
      0,
      `Starting deep search for reactions in ${nodeIds.length} nodes and their children`,
    );

    // Function to find nodes with reactions from the node and all its children
    async function findNodesWithReactions(
      node: BaseNode,
      processedNodes: Set<string> = new Set<string>(),
      depth = 0,
      results: ReactionResult[] = [],
    ): Promise<ReactionResult[]> {
      // Skip already processed nodes (prevent circular references)
      if (processedNodes.has(node.id)) {
        return results;
      }

      processedNodes.add(node.id);

      // Check if the current node has reactions. Not every BaseNode implements ReactionMixin.
      let filteredReactions: ReadonlyArray<ReactionLike> = [];
      if ("reactions" in node) {
        const reactions = (node as BaseNode & ReactionMixin)
          .reactions as ReadonlyArray<ReactionLike>;
        if (reactions.length > 0) {
          filteredReactions = reactions.filter((reaction) => {
            if (reaction.action?.navigation === "CHANGE_TO") return false;
            if (Array.isArray(reaction.actions)) {
              return !reaction.actions.some((action) => action.navigation === "CHANGE_TO");
            }
            return true;
          });
        }
      }
      const hasFilteredReactions = filteredReactions.length > 0;

      // If the node has filtered reactions, add it to results and apply highlight effect
      if (hasFilteredReactions) {
        results.push({
          id: node.id,
          name: node.name,
          type: node.type,
          depth: depth,
          hasReactions: true,
          reactions: filteredReactions,
          path: getNodePath(node),
        });
        // Apply highlight effect (orange border)
        await highlightNodeWithAnimation(node);
      }

      // If node has children, recursively search them.
      if (hasChildren(node)) {
        for (const child of node.children) {
          await findNodesWithReactions(child, processedNodes, depth + 1, results);
        }
      }

      return results;
    }

    // Function to apply animated highlight effect to a node
    async function highlightNodeWithAnimation(node: BaseNode) {
      if (!("strokes" in node) || !("strokeWeight" in node)) {
        return;
      }

      const strokeNode = node as BaseNode & GeometryMixin;
      const originalStrokeWeight = strokeNode.strokeWeight;
      const originalStrokes = [...strokeNode.strokes];

      try {
        strokeNode.strokeWeight = 4;
        strokeNode.strokes = [
          {
            type: "SOLID",
            color: { r: 1, g: 0.5, b: 0 },
            opacity: 0.8,
          },
        ];

        setTimeout(() => {
          try {
            strokeNode.strokeWeight = originalStrokeWeight;
            strokeNode.strokes = originalStrokes;
          } catch (restoreError) {
            console.error(`Error restoring node stroke: ${errorMessage(restoreError)}`);
          }
        }, 1500);
      } catch (highlightError) {
        console.error(`Error highlighting node: ${errorMessage(highlightError)}`);
      }
    }

    // Get node hierarchy path as a string
    function getNodePath(node: BaseNode): string {
      const path: string[] = [];
      let current: BaseNode | null = node;

      while (current && current.parent) {
        path.unshift(current.name);
        current = current.parent;
      }

      return path.join(" > ");
    }

    // Array to store all results
    let allResults: ReactionResult[] = [];
    let processedCount = 0;
    const totalCount = nodeIds.length;

    // Iterate through each node and its children to search for reactions
    for (let i = 0; i < nodeIds.length; i++) {
      try {
        const nodeId = nodeIds[i];
        const node = await figma.getNodeByIdAsync(nodeId);

        if (!node) {
          processedCount++;
          sendProgressUpdate(
            commandId,
            "get_reactions",
            "in_progress",
            Math.round((processedCount / totalCount) * 100),
            totalCount,
            processedCount,
            `Node not found: ${nodeId}`,
          );
          continue;
        }

        // Search for reactions in the node and its children
        const processedNodes = new Set<string>();
        const nodeResults = await findNodesWithReactions(node, processedNodes);

        // Add results
        allResults = allResults.concat(nodeResults);

        // Update progress
        processedCount++;
        sendProgressUpdate(
          commandId,
          "get_reactions",
          "in_progress",
          Math.round((processedCount / totalCount) * 100),
          totalCount,
          processedCount,
          `Processed node ${processedCount}/${totalCount}, found ${nodeResults.length} nodes with reactions`,
        );
      } catch (error) {
        processedCount++;
        sendProgressUpdate(
          commandId,
          "get_reactions",
          "in_progress",
          Math.round((processedCount / totalCount) * 100),
          totalCount,
          processedCount,
          `Error processing node: ${errorMessage(error)}`,
        );
      }
    }

    // Completion update
    sendProgressUpdate(
      commandId,
      "get_reactions",
      "completed",
      100,
      totalCount,
      totalCount,
      `Completed deep search: found ${allResults.length} nodes with reactions.`,
    );

    return {
      nodesCount: nodeIds.length,
      nodesWithReactions: allResults.length,
      nodes: allResults,
    };
  } catch (error) {
    throw new Error(`Failed to get reactions: ${errorMessage(error)}`);
  }
}

async function readMyDesign() {
  try {
    // Load all selected nodes in parallel
    const nodes = await Promise.all(
      figma.currentPage.selection.map((node: SceneNode) => figma.getNodeByIdAsync(node.id)),
    );

    // Filter out any null values (nodes that weren't found)
    const validNodes = nodes.filter((node) => node !== null);

    // Export all valid nodes in parallel
    const responses = await Promise.all(
      validNodes.map(async (node) => {
        if (node.type === "DOCUMENT") {
          throw new Error(`Document node cannot be exported: ${node.id}`);
        }
        const response = (await node.exportAsync({
          format: "JSON_REST_V1",
        })) as FigmaRestExportResponse;
        return {
          nodeId: node.id,
          document: filterFigmaNode(response.document),
        };
      }),
    );

    return responses;
  } catch (error) {
    throw new Error(`Error getting nodes info: ${errorMessage(error)}`);
  }
}

async function createRectangle(params: CreateRectangleParams) {
  const { x = 0, y = 0, width = 100, height = 100, name = "Rectangle", parentId } = params || {};

  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.name = name;

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    (parentNode as ChildrenMixin).appendChild(rect);
  } else {
    figma.currentPage.appendChild(rect);
  }

  return {
    id: rect.id,
    name: rect.name,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    parentId: rect.parent ? rect.parent.id : undefined,
  };
}

async function createFrame(params: CreateFrameParams) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Frame",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
    layoutMode = "NONE",
    layoutWrap = "NO_WRAP",
    paddingTop = 10,
    paddingRight = 10,
    paddingBottom = 10,
    paddingLeft = 10,
    primaryAxisAlignItems = "MIN",
    counterAxisAlignItems = "MIN",
    layoutSizingHorizontal = "FIXED",
    layoutSizingVertical = "FIXED",
    itemSpacing = 0,
  } = params || {};

  const frame = figma.createFrame();
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.name = name;

  // Set layout mode if provided
  if (layoutMode !== "NONE") {
    frame.layoutMode = layoutMode;
    frame.layoutWrap = layoutWrap;

    // Set padding values only when layoutMode is not NONE
    frame.paddingTop = paddingTop;
    frame.paddingRight = paddingRight;
    frame.paddingBottom = paddingBottom;
    frame.paddingLeft = paddingLeft;

    // Set axis alignment only when layoutMode is not NONE
    frame.primaryAxisAlignItems = primaryAxisAlignItems;
    frame.counterAxisAlignItems = counterAxisAlignItems;

    // Set layout sizing only when layoutMode is not NONE
    frame.layoutSizingHorizontal = layoutSizingHorizontal;
    frame.layoutSizingVertical = layoutSizingVertical;

    // Set item spacing only when layoutMode is not NONE
    frame.itemSpacing = itemSpacing;
  }

  // Set fill color if provided
  if (fillColor) {
    const paintStyle: SolidPaint = {
      type: "SOLID",
      color: {
        r: toFiniteNumber(fillColor.r, 0),
        g: toFiniteNumber(fillColor.g, 0),
        b: toFiniteNumber(fillColor.b, 0),
      },
      opacity: toFiniteNumber(fillColor.a, 1),
    };
    frame.fills = [paintStyle];
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    const strokeStyle: SolidPaint = {
      type: "SOLID",
      color: {
        r: toFiniteNumber(strokeColor.r, 0),
        g: toFiniteNumber(strokeColor.g, 0),
        b: toFiniteNumber(strokeColor.b, 0),
      },
      opacity: toFiniteNumber(strokeColor.a, 1),
    };
    frame.strokes = [strokeStyle];
  }

  // Set stroke weight if provided
  if (strokeWeight !== undefined) {
    frame.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    (parentNode as ChildrenMixin).appendChild(frame);
  } else {
    figma.currentPage.appendChild(frame);
  }

  return {
    id: frame.id,
    name: frame.name,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    fills: frame.fills,
    strokes: frame.strokes,
    strokeWeight: frame.strokeWeight,
    layoutMode: frame.layoutMode,
    layoutWrap: frame.layoutWrap,
    parentId: frame.parent ? frame.parent.id : undefined,
  };
}

async function createText(params: CreateTextParams) {
  const {
    x = 0,
    y = 0,
    text = "Text",
    fontSize = 14,
    fontWeight = 400,
    fontColor = { r: 0, g: 0, b: 0, a: 1 }, // Default to black
    name = "",
    parentId,
    fontFamily = "Inter",
    fontStyle,
    textAlignHorizontal,
    width,
    height,
    textAutoResize,
    lineHeight,
  } = params || {};

  // Map common font weights to Figma font styles
  const getFontStyle = (weight: number): string => {
    switch (weight) {
      case 100:
        return "Thin";
      case 200:
        return "Extra Light";
      case 300:
        return "Light";
      case 400:
        return "Regular";
      case 500:
        return "Medium";
      case 600:
        return "Semi Bold";
      case 700:
        return "Bold";
      case 800:
        return "Extra Bold";
      case 900:
        return "Black";
      default:
        return "Regular";
    }
  };

  const textNode = figma.createText();
  textNode.x = x;
  textNode.y = y;
  textNode.name = name || text;

  // Resolve the requested font, falling back to Inter Regular if unavailable
  // so a bad family/style never hard-fails the whole call.
  const requestedStyle = fontStyle || getFontStyle(fontWeight);
  let appliedFont = { family: fontFamily, style: requestedStyle };
  let fontFallbackNote;
  try {
    await figma.loadFontAsync(appliedFont);
  } catch (error) {
    fontFallbackNote = `Requested font "${fontFamily} ${requestedStyle}" unavailable; fell back to Inter Regular.`;
    console.warn(fontFallbackNote, error);
    appliedFont = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(appliedFont);
  }

  textNode.fontName = appliedFont;
  textNode.fontSize = Number(fontSize);

  if (lineHeight !== undefined && lineHeight !== null) {
    textNode.lineHeight = { value: Number(lineHeight), unit: "PIXELS" };
  }
  if (textAlignHorizontal) {
    textNode.textAlignHorizontal = textAlignHorizontal;
  }
  if (textAutoResize) {
    textNode.textAutoResize = textAutoResize;
  }

  await setCharacters(textNode, text);

  // Apply a fixed width when requested. Unless the caller explicitly asked for
  // NONE, keep height auto so the text reflows within the given width.
  if (width !== undefined && width !== null) {
    if (textAutoResize !== "NONE" && textAutoResize !== "WIDTH_AND_HEIGHT") {
      textNode.textAutoResize = "HEIGHT";
    }
    const targetHeight = height !== undefined && height !== null ? height : textNode.height;
    textNode.resize(width, targetHeight);
  } else if (height !== undefined && height !== null) {
    textNode.resize(textNode.width, height);
  }

  // Set text color
  const paintStyle: SolidPaint = {
    type: "SOLID",
    color: {
      r: toFiniteNumber(fontColor.r, 0),
      g: toFiniteNumber(fontColor.g, 0),
      b: toFiniteNumber(fontColor.b, 0),
    },
    opacity: toFiniteNumber(fontColor.a, 1),
  };
  textNode.fills = [paintStyle];

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    (parentNode as ChildrenMixin).appendChild(textNode);
  } else {
    figma.currentPage.appendChild(textNode);
  }

  return {
    id: textNode.id,
    name: textNode.name,
    x: textNode.x,
    y: textNode.y,
    width: textNode.width,
    height: textNode.height,
    characters: textNode.characters,
    fontSize: textNode.fontSize,
    fontWeight: fontWeight,
    fontColor: fontColor,
    fontName: textNode.fontName,
    textAlignHorizontal: textNode.textAlignHorizontal,
    lineHeight: textNode.lineHeight,
    fills: textNode.fills,
    parentId: textNode.parent ? textNode.parent.id : undefined,
    fontFallbackNote,
  };
}

async function setFillColor(params: SetFillColorParams) {
  console.log("setFillColor", params);
  const { nodeId, color } = params;

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!color) {
    throw new Error("Missing color parameter");
  }
  const { r, g, b, a } = color;

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error(`Node does not support fills: ${nodeId}`);
  }

  // Create RGBA color
  const rgbColor = {
    r: toFiniteNumber(r, 0),
    g: toFiniteNumber(g, 0),
    b: toFiniteNumber(b, 0),
    a: toFiniteNumber(a, 1),
  };

  // Set fill
  const paintStyle: SolidPaint = {
    type: "SOLID",
    color: {
      r: Number(rgbColor.r),
      g: Number(rgbColor.g),
      b: Number(rgbColor.b),
    },
    opacity: Number(rgbColor.a),
  };

  console.log("paintStyle", paintStyle);

  node.fills = [paintStyle];

  return {
    id: node.id,
    name: node.name,
    fills: [paintStyle],
  };
}

async function setStrokeColor(params: SetStrokeColorParams) {
  const { nodeId, color, weight = 1 } = params;

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!color) {
    throw new Error("Missing color parameter");
  }
  const { r, g, b, a } = color;

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("strokes" in node)) {
    throw new Error(`Node does not support strokes: ${nodeId}`);
  }

  // Create RGBA color
  const rgbColor = {
    r: toFiniteNumber(r, 0),
    g: toFiniteNumber(g, 0),
    b: toFiniteNumber(b, 0),
    a: toFiniteNumber(a, 1),
  };

  // Set stroke
  const paintStyle: SolidPaint = {
    type: "SOLID",
    color: {
      r: rgbColor.r,
      g: rgbColor.g,
      b: rgbColor.b,
    },
    opacity: rgbColor.a,
  };

  node.strokes = [paintStyle];

  // Set stroke weight if available
  if ("strokeWeight" in node) {
    node.strokeWeight = weight;
  }

  return {
    id: node.id,
    name: node.name,
    strokes: node.strokes,
    strokeWeight: "strokeWeight" in node ? node.strokeWeight : undefined,
  };
}

async function moveNode(params: MoveNodeParams) {
  const { nodeId, x, y } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (x === undefined || y === undefined) {
    throw new Error("Missing x or y parameters");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("x" in node) || !("y" in node)) {
    throw new Error(`Node does not support position: ${nodeId}`);
  }

  node.x = x;
  node.y = y;

  return {
    id: node.id,
    name: node.name,
    x: node.x,
    y: node.y,
  };
}

async function resizeNode(params: ResizeNodeParams) {
  const { nodeId, width, height } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (width === undefined || height === undefined) {
    throw new Error("Missing width or height parameters");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("resize" in node)) {
    throw new Error(`Node does not support resizing: ${nodeId}`);
  }

  node.resize(width, height);

  return {
    id: node.id,
    name: node.name,
    width: node.width,
    height: node.height,
  };
}

async function deleteNode(params: NodeIdParams) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Save node info before deleting
  const nodeInfo = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  node.remove();

  return nodeInfo;
}

async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map((style: PaintStyle) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map((style: TextStyle) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map((style: EffectStyle) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map((style: GridStyle) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

async function getLocalComponents(params: GetLocalComponentsParams = {}) {
  const commandId = (params && params.commandId) || generateCommandId();
  const pages = figma.root.children;
  const totalPages = pages.length;

  await sendProgressUpdate(
    commandId,
    "get_local_components",
    "started",
    0,
    totalPages,
    0,
    "Starting component scan across " + totalPages + " pages...",
    null,
  );

  const allComponents: Array<{ id: string; name: string; key: string | null }> = [];

  for (var i = 0; i < totalPages; i++) {
    var page = pages[i];
    await page.loadAsync();

    var pageComponents = page.findAllWithCriteria({ types: ["COMPONENT"] });

    for (var j = 0; j < pageComponents.length; j++) {
      var component = pageComponents[j];
      allComponents.push({
        id: component.id,
        name: component.name,
        key: "key" in component ? component.key : null,
      });
    }

    var progress = Math.round(((i + 1) / totalPages) * 100);
    await sendProgressUpdate(
      commandId,
      "get_local_components",
      "in_progress",
      progress,
      totalPages,
      i + 1,
      "Scanned " +
        page.name +
        ": " +
        pageComponents.length +
        " components (total so far: " +
        allComponents.length +
        ")",
      null,
    );
  }

  await sendProgressUpdate(
    commandId,
    "get_local_components",
    "completed",
    100,
    totalPages,
    totalPages,
    "Found " + allComponents.length + " components across " + totalPages + " pages",
    null,
  );

  return {
    count: allComponents.length,
    components: allComponents,
  };
}

// async function getTeamComponents() {
//   try {
//     const teamComponents =
//       await figma.teamLibrary.getAvailableComponentsAsync();

//     return {
//       count: teamComponents.length,
//       components: teamComponents.map((component) => ({
//         key: component.key,
//         name: component.name,
//         description: component.description,
//         libraryName: component.libraryName,
//       })),
//     };
//   } catch (error) {
//     throw new Error(`Error getting team components: ${errorMessage(error)}`);
//   }
// }

async function createComponentInstance(params: CreateComponentInstanceParams) {
  const { componentKey, componentId, x = 0, y = 0, parentId } = params || {};

  if (!componentKey && !componentId) {
    throw new Error(
      "Missing componentKey or componentId parameter. Use componentId for local components (from get_local_components), or componentKey for published library components.",
    );
  }

  try {
    let component: ComponentNode;

    if (componentId) {
      // Local component: get node directly by ID
      const node = await figma.getNodeByIdAsync(componentId);
      if (!node) {
        throw new Error(`Component node not found with id: ${componentId}`);
      }
      if (node.type !== "COMPONENT") {
        throw new Error(
          `Node ${componentId} is not a COMPONENT (got type: ${node.type}). Use get_local_components to find valid component IDs.`,
        );
      }
      component = node;
    } else {
      // Published library component: import by key
      if (!componentKey) {
        throw new Error("Missing componentKey parameter");
      }
      component = await figma.importComponentByKeyAsync(componentKey);
    }

    const instance = component.createInstance();
    instance.x = x;
    instance.y = y;

    if (parentId) {
      const parent = await figma.getNodeByIdAsync(parentId);
      if (parent && "appendChild" in parent) {
        (parent as ChildrenMixin).appendChild(instance);
      } else {
        figma.currentPage.appendChild(instance);
      }
    } else {
      figma.currentPage.appendChild(instance);
    }

    const mainComponent = await instance.getMainComponentAsync();

    return {
      id: instance.id,
      name: instance.name,
      x: instance.x,
      y: instance.y,
      width: instance.width,
      height: instance.height,
      mainComponentId: mainComponent ? mainComponent.id : undefined,
    };
  } catch (error) {
    throw new Error(`Error creating component instance: ${errorMessage(error)}`);
  }
}

async function exportNodeAsImage(params: ExportNodeAsImageParams) {
  const { nodeId, format = "PNG", scale = 1 } = params || {};
  if (!["PNG", "JPG", "SVG", "PDF"].includes(format)) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("exportAsync" in node)) {
    throw new Error(`Node does not support exporting: ${nodeId}`);
  }

  try {
    const settings: ExportSettingsImage | ExportSettingsSVG | ExportSettingsPDF =
      format === "PNG" || format === "JPG"
        ? { format, constraint: { type: "SCALE", value: scale } }
        : { format };

    const bytes = await node.exportAsync(settings);

    const mimeType = {
      PNG: "image/png",
      JPG: "image/jpeg",
      SVG: "image/svg+xml",
      PDF: "application/pdf",
    }[format];

    // Proper way to convert Uint8Array to base64
    const base64 = customBase64Encode(bytes);
    // const imageData = `data:${mimeType};base64,${base64}`;

    return {
      nodeId,
      format,
      scale,
      mimeType,
      imageData: base64,
    };
  } catch (error) {
    throw new Error(`Error exporting node as image: ${errorMessage(error)}`);
  }
}
function customBase64Encode(bytes: Uint8Array): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
    d = chunk & 63; // 63 = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3 = 2^2 - 1

    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15 = 2^4 - 1

    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}

async function setCornerRadius(params: SetCornerRadiusParams) {
  const { nodeId, radius, corners } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (radius === undefined) {
    throw new Error("Missing radius parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // ConnectorNode and ShapeWithTextNode expose cornerRadius as read-only.
  if (!("cornerRadius" in node) || node.type === "CONNECTOR" || node.type === "SHAPE_WITH_TEXT") {
    throw new Error(`Node does not support writable corner radius: ${nodeId}`);
  }

  const cornerNode = node as BaseNode & CornerMixin;

  // If corners array is provided, set individual corner radii
  if (corners && Array.isArray(corners) && corners.length === 4) {
    if ("topLeftRadius" in node) {
      const rectangleCornerNode = node as BaseNode & CornerMixin & RectangleCornerMixin;
      if (corners[0]) rectangleCornerNode.topLeftRadius = radius;
      if (corners[1]) rectangleCornerNode.topRightRadius = radius;
      if (corners[2]) rectangleCornerNode.bottomRightRadius = radius;
      if (corners[3]) rectangleCornerNode.bottomLeftRadius = radius;
    } else {
      cornerNode.cornerRadius = radius;
    }
  } else {
    cornerNode.cornerRadius = radius;
  }

  return {
    id: node.id,
    name: node.name,
    cornerRadius: "cornerRadius" in node ? node.cornerRadius : undefined,
    topLeftRadius: "topLeftRadius" in node ? node.topLeftRadius : undefined,
    topRightRadius: "topRightRadius" in node ? node.topRightRadius : undefined,
    bottomRightRadius: "bottomRightRadius" in node ? node.bottomRightRadius : undefined,
    bottomLeftRadius: "bottomLeftRadius" in node ? node.bottomLeftRadius : undefined,
  };
}

async function setTextContent(params: SetTextContentParams) {
  const { nodeId, text } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (text === undefined) {
    throw new Error("Missing text parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    if (node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName);
    }

    await setCharacters(node, text, { smartStrategy: "prevail" });

    return {
      id: node.id,
      name: node.name,
      characters: node.characters,
      fontName: node.fontName,
    };
  } catch (error) {
    throw new Error(`Error setting text content: ${errorMessage(error)}`);
  }
}

// Initialize settings on load
const settingsReady = (async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync("settings");
    if (savedSettings) {
      if (
        Number.isInteger(savedSettings.serverPort) &&
        savedSettings.serverPort > 0 &&
        savedSettings.serverPort <= 65535
      ) {
        state.serverPort = savedSettings.serverPort;
      }
      if (typeof savedSettings.channel === "string" && savedSettings.channel.trim()) {
        state.channel = savedSettings.channel.trim();
      }
    }

    // Send initial settings to UI
    figma.ui.postMessage({
      type: "init-settings",
      settings: {
        serverPort: state.serverPort,
        channel: state.channel,
      },
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  }
})();

function uniqBy<T, K>(arr: readonly T[], predicate: (item: T) => K): T[] {
  return [...new Map(arr.map((item) => [predicate(item), item] as const)).values()];
}

const setCharacters = async (
  node: TextNode,
  characters: string,
  options?: SetCharactersOptions,
): Promise<boolean> => {
  const fallbackFont: FontName = options?.fallbackFont ?? {
    family: "Inter",
    style: "Regular",
  };

  try {
    if (node.fontName === figma.mixed) {
      if (options?.smartStrategy === "strict") {
        return setCharactersWithStrictMatchFont(node, characters, fallbackFont);
      }
      if (options?.smartStrategy === "experimental") {
        return setCharactersWithSmartMatchFont(node, characters, fallbackFont);
      }

      let selectedFont: FontName = fallbackFont;
      if (node.characters.length > 0) {
        if (options?.smartStrategy === "prevail") {
          const fontFrequency: Record<string, { font: FontName; count: number }> = {};
          for (let i = 0; i < node.characters.length; i++) {
            const rangeFont = node.getRangeFontName(i, i + 1);
            if (!isFontName(rangeFont)) continue;
            const key = `${rangeFont.family}::${rangeFont.style}`;
            const current = fontFrequency[key];
            fontFrequency[key] = current
              ? { font: current.font, count: current.count + 1 }
              : { font: rangeFont, count: 1 };
          }
          const mostUsed = Object.values(fontFrequency).sort((a, b) => b.count - a.count)[0];
          if (mostUsed) selectedFont = mostUsed.font;
        } else {
          const firstCharFont = node.getRangeFontName(0, 1);
          if (isFontName(firstCharFont)) selectedFont = firstCharFont;
        }
      }

      await figma.loadFontAsync(selectedFont);
      node.fontName = selectedFont;
    } else {
      await figma.loadFontAsync(node.fontName);
    }
  } catch (error) {
    const current =
      node.fontName === figma.mixed ? "mixed" : `${node.fontName.family} ${node.fontName.style}`;
    console.warn(
      `Failed to load "${current}" font and replaced with fallback "${fallbackFont.family} ${fallbackFont.style}"`,
      error,
    );
    await figma.loadFontAsync(fallbackFont);
    node.fontName = fallbackFont;
  }

  try {
    node.characters = characters;
    return true;
  } catch (error) {
    console.warn("Failed to set characters. Skipped.", error);
    return false;
  }
};

type FontRange = { start: number; end: number; font: FontName };

function collectFontRanges(node: TextNode): FontRange[] {
  const ranges: FontRange[] = [];
  const length = node.characters.length;
  let index = 0;

  while (index < length) {
    const start = index;
    const startFontValue = node.getRangeFontName(start, start + 1);
    if (!isFontName(startFontValue)) {
      index++;
      continue;
    }

    index++;
    while (index < length) {
      const nextFontValue = node.getRangeFontName(index, index + 1);
      if (
        !isFontName(nextFontValue) ||
        nextFontValue.family !== startFontValue.family ||
        nextFontValue.style !== startFontValue.style
      ) {
        break;
      }
      index++;
    }

    ranges.push({ start, end: index, font: startFontValue });
  }

  return ranges;
}

const setCharactersWithStrictMatchFont = async (
  node: TextNode,
  characters: string,
  fallbackFont: FontName,
): Promise<boolean> => {
  const ranges = collectFontRanges(node);

  await figma.loadFontAsync(fallbackFont);
  node.fontName = fallbackFont;
  node.characters = characters;

  await Promise.all(
    ranges.map(async ({ start, end, font }) => {
      if (start >= characters.length) return;
      const boundedEnd = Math.min(end, characters.length);
      await figma.loadFontAsync(font);
      node.setRangeFontName(start, boundedEnd, font);
    }),
  );

  return true;
};

const getDelimiterPos = (
  str: string,
  delimiter: string,
  startIdx = 0,
  endIdx = str.length,
): Array<[number, number]> => {
  const indices: Array<[number, number]> = [];
  let segmentStart = startIdx;

  for (let i = startIdx; i < endIdx; i++) {
    if (str[i] === delimiter) {
      if (segmentStart < i) indices.push([segmentStart, i]);
      segmentStart = i + 1;
    }
  }

  if (segmentStart < endIdx) indices.push([segmentStart, endIdx]);
  return indices;
};

const buildLinearOrder = (node: TextNode): FontTreeEntry[] => {
  const fontTree: FontTreeEntry[] = [];
  const lineRanges = getDelimiterPos(node.characters, "\n");

  for (const [lineStart, lineEnd] of lineRanges) {
    const lineFont = node.getRangeFontName(lineStart, lineEnd);
    if (isFontName(lineFont)) {
      fontTree.push({
        start: lineStart,
        delimiter: "\n",
        family: lineFont.family,
        style: lineFont.style,
      });
      continue;
    }

    const wordRanges = getDelimiterPos(node.characters, " ", lineStart, lineEnd);
    for (const [wordStart, wordEnd] of wordRanges) {
      const wordFont = node.getRangeFontName(wordStart, wordEnd);
      let resolvedFont: FontName | null = isFontName(wordFont) ? wordFont : null;
      if (!resolvedFont && wordStart < wordEnd) {
        const firstCharFont = node.getRangeFontName(wordStart, wordStart + 1);
        if (isFontName(firstCharFont)) resolvedFont = firstCharFont;
      }
      if (!resolvedFont) continue;

      fontTree.push({
        start: wordStart,
        delimiter: " ",
        family: resolvedFont.family,
        style: resolvedFont.style,
      });
    }
  }

  return fontTree.sort((a, b) => a.start - b.start);
};

const setCharactersWithSmartMatchFont = async (
  node: TextNode,
  characters: string,
  fallbackFont: FontName,
): Promise<boolean> => {
  const rangeTree = buildLinearOrder(node);
  const fontsToLoad = uniqBy(
    rangeTree.map(({ family, style }) => ({ family, style })),
    ({ family, style }) => `${family}::${style}`,
  );

  await Promise.all([...fontsToLoad, fallbackFont].map((font) => figma.loadFontAsync(font)));

  node.fontName = fallbackFont;
  node.characters = characters;

  let prevPos = 0;
  rangeTree.forEach(({ family, style, delimiter }) => {
    if (prevPos >= node.characters.length) return;
    const delimiterPos = node.characters.indexOf(delimiter, prevPos);
    const endPos = delimiterPos > prevPos ? delimiterPos : node.characters.length;
    const matchedFont: FontName = { family, style };
    node.setRangeFontName(prevPos, endPos, matchedFont);
    prevPos = endPos + 1;
  });
  return true;
};

// Add the cloneNode function implementation
async function cloneNode(params: CloneNodeParams) {
  const { nodeId, x, y, positionMode = "parent" } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (node.type === "DOCUMENT" || node.type === "PAGE") {
    throw new Error(`Node type ${node.type} cannot be cloned by this command`);
  }

  // All remaining BaseNode variants are SceneNode variants and expose clone().
  const clone = node.clone();

  // Add the clone to the same parent as the original node first, so that
  // parent-relative positioning and absolute-coordinate conversion are correct.
  if (node.parent) {
    node.parent.appendChild(clone);
  } else {
    figma.currentPage.appendChild(clone);
  }

  // If x and y are provided, move the clone to that position. By default x/y are
  // parent-relative (matching Figma's coordinate system). When positionMode is
  // "frame", x/y are treated as absolute canvas coordinates and converted to the
  // parent's local space so the clone lands where the agent intends.
  if (x !== undefined && y !== undefined) {
    if (!("x" in clone) || !("y" in clone)) {
      throw new Error(`Cloned node does not support position: ${nodeId}`);
    }
    if (positionMode === "frame") {
      let parentAbs = { x: 0, y: 0 };
      const parent = clone.parent;
      if (parent && "absoluteBoundingBox" in parent && parent.absoluteBoundingBox) {
        parentAbs = parent.absoluteBoundingBox;
      }
      clone.x = x - parentAbs.x;
      clone.y = y - parentAbs.y;
    } else {
      clone.x = x;
      clone.y = y;
    }
  }

  return {
    id: clone.id,
    name: clone.name,
    // Parent-relative coordinates (Figma's native x/y).
    x: "x" in clone ? clone.x : undefined,
    y: "y" in clone ? clone.y : undefined,
    width: "width" in clone ? clone.width : undefined,
    height: "height" in clone ? clone.height : undefined,
    // Absolute canvas position so the agent can verify placement.
    absoluteBoundingBox: "absoluteBoundingBox" in clone ? clone.absoluteBoundingBox : undefined,
    parentId: clone.parent ? clone.parent.id : undefined,
  };
}

async function scanTextNodes(params: ScanTextNodesParams) {
  console.log(`Starting to scan text nodes from node ID: ${params.nodeId}`);
  const {
    nodeId,
    useChunking = true,
    chunkSize = 10,
    commandId = generateCommandId(),
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    // Send error progress update
    sendProgressUpdate(
      commandId,
      "scan_text_nodes",
      "error",
      0,
      0,
      0,
      `Node with ID ${nodeId} not found`,
      { error: `Node not found: ${nodeId}` },
    );
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // If chunking is not enabled, use the original implementation
  if (!useChunking) {
    const textNodes: SafeTextNode[] = [];
    try {
      // Send started progress update
      sendProgressUpdate(
        commandId,
        "scan_text_nodes",
        "started",
        0,
        1, // Not known yet how many nodes there are
        0,
        `Starting scan of node "${node.name || nodeId}" without chunking`,
        null,
      );

      await findTextNodes(node, [], 0, textNodes);

      // Send completed progress update
      sendProgressUpdate(
        commandId,
        "scan_text_nodes",
        "completed",
        100,
        textNodes.length,
        textNodes.length,
        `Scan complete. Found ${textNodes.length} text nodes.`,
        { textNodes },
      );

      return {
        success: true,
        message: `Scanned ${textNodes.length} text nodes.`,
        count: textNodes.length,
        textNodes: textNodes,
        commandId,
      };
    } catch (error) {
      console.error("Error scanning text nodes:", error);

      // Send error progress update
      sendProgressUpdate(
        commandId,
        "scan_text_nodes",
        "error",
        0,
        0,
        0,
        `Error scanning text nodes: ${errorMessage(error)}`,
        { error: errorMessage(error) },
      );

      throw new Error(`Error scanning text nodes: ${errorMessage(error)}`);
    }
  }

  // Chunked implementation
  console.log(`Using chunked scanning with chunk size: ${chunkSize}`);

  // First, collect all nodes to process (without processing them yet)
  const nodesToProcess: NodeProcessInfo[] = [];

  // Send started progress update
  sendProgressUpdate(
    commandId,
    "scan_text_nodes",
    "started",
    0,
    0, // Not known yet how many nodes there are
    0,
    `Starting chunked scan of node "${node.name || nodeId}"`,
    { chunkSize },
  );

  await collectNodesToProcess(node, [], 0, nodesToProcess);

  const totalNodes = nodesToProcess.length;
  console.log(`Found ${totalNodes} total nodes to process`);

  // Calculate number of chunks needed
  const totalChunks = Math.ceil(totalNodes / chunkSize);
  console.log(`Will process in ${totalChunks} chunks`);

  // Send update after node collection
  sendProgressUpdate(
    commandId,
    "scan_text_nodes",
    "in_progress",
    5, // 5% progress for collection phase
    totalNodes,
    0,
    `Found ${totalNodes} nodes to scan. Will process in ${totalChunks} chunks.`,
    {
      totalNodes,
      totalChunks,
      chunkSize,
    },
  );

  // Process nodes in chunks
  const allTextNodes: SafeTextNode[] = [];
  let processedNodes = 0;
  let chunksProcessed = 0;

  for (let i = 0; i < totalNodes; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, totalNodes);
    console.log(
      `Processing chunk ${chunksProcessed + 1}/${totalChunks} (nodes ${i} to ${chunkEnd - 1})`,
    );

    // Send update before processing chunk
    sendProgressUpdate(
      commandId,
      "scan_text_nodes",
      "in_progress",
      Math.round(5 + (chunksProcessed / totalChunks) * 90), // 5-95% for processing
      totalNodes,
      processedNodes,
      `Processing chunk ${chunksProcessed + 1}/${totalChunks}`,
      {
        currentChunk: chunksProcessed + 1,
        totalChunks,
        textNodesFound: allTextNodes.length,
      },
    );

    const chunkNodes = nodesToProcess.slice(i, chunkEnd);
    const chunkTextNodes: SafeTextNode[] = [];

    // Process each node in this chunk
    for (const nodeInfo of chunkNodes) {
      if (nodeInfo.node.type === "TEXT") {
        try {
          const textNodeInfo = await processTextNode(
            nodeInfo.node,
            nodeInfo.parentPath,
            nodeInfo.depth,
          );
          if (textNodeInfo) {
            chunkTextNodes.push(textNodeInfo);
          }
        } catch (error) {
          console.error(`Error processing text node: ${errorMessage(error)}`);
          // Continue with other nodes
        }
      }

      // Brief delay to allow UI updates and prevent freezing
      await delay(5);
    }

    // Add results from this chunk
    allTextNodes.push(...chunkTextNodes);
    processedNodes += chunkNodes.length;
    chunksProcessed++;

    // Send update after processing chunk
    sendProgressUpdate(
      commandId,
      "scan_text_nodes",
      "in_progress",
      Math.round(5 + (chunksProcessed / totalChunks) * 90), // 5-95% for processing
      totalNodes,
      processedNodes,
      `Processed chunk ${chunksProcessed}/${totalChunks}. Found ${allTextNodes.length} text nodes so far.`,
      {
        currentChunk: chunksProcessed,
        totalChunks,
        processedNodes,
        textNodesFound: allTextNodes.length,
        chunkResult: chunkTextNodes,
      },
    );

    // Small delay between chunks to prevent UI freezing
    if (i + chunkSize < totalNodes) {
      await delay(50);
    }
  }

  // Send completed progress update
  sendProgressUpdate(
    commandId,
    "scan_text_nodes",
    "completed",
    100,
    totalNodes,
    processedNodes,
    `Scan complete. Found ${allTextNodes.length} text nodes.`,
    {
      textNodes: allTextNodes,
      processedNodes,
      chunks: chunksProcessed,
    },
  );

  return {
    success: true,
    message: `Chunked scan complete. Found ${allTextNodes.length} text nodes.`,
    totalNodes: allTextNodes.length,
    processedNodes: processedNodes,
    chunks: chunksProcessed,
    textNodes: allTextNodes,
    commandId,
  };
}

// Helper function to collect all nodes that need to be processed
async function collectNodesToProcess(
  node: BaseNode,
  parentPath: string[] = [],
  depth = 0,
  nodesToProcess: NodeProcessInfo[] = [],
): Promise<void> {
  // Skip invisible nodes
  if ("visible" in node && node.visible === false) return;

  // Get the path to this node
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];

  // Add this node to the processing list
  nodesToProcess.push({
    node: node,
    parentPath: nodePath,
    depth: depth,
  });

  // Recursively add children
  if ("children" in node) {
    for (const child of node.children) {
      await collectNodesToProcess(child, nodePath, depth + 1, nodesToProcess);
    }
  }
}

// Process a single text node
async function processTextNode(
  node: BaseNode,
  parentPath: string[],
  depth: number,
): Promise<SafeTextNode | null> {
  if (node.type !== "TEXT") return null;

  try {
    // Safely extract font information
    let fontFamily = "";
    let fontStyle = "";

    if (node.fontName) {
      if (typeof node.fontName === "object") {
        if ("family" in node.fontName) fontFamily = node.fontName.family;
        if ("style" in node.fontName) fontStyle = node.fontName.style;
      }
    }

    // Create a safe representation of the text node
    const safeTextNode = {
      id: node.id,
      name: node.name || "Text",
      type: node.type,
      characters: node.characters,
      fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
      fontFamily: fontFamily,
      fontStyle: fontStyle,
      x: typeof node.x === "number" ? node.x : 0,
      y: typeof node.y === "number" ? node.y : 0,
      width: typeof node.width === "number" ? node.width : 0,
      height: typeof node.height === "number" ? node.height : 0,
      path: parentPath.join(" > "),
      depth: depth,
    };

    // Highlight the node briefly (optional visual feedback)
    try {
      const originalFills = JSON.parse(JSON.stringify(node.fills));
      node.fills = [
        {
          type: "SOLID",
          color: { r: 1, g: 0.5, b: 0 },
          opacity: 0.3,
        },
      ];

      // Brief delay for the highlight to be visible
      await delay(100);

      try {
        node.fills = originalFills;
      } catch (err) {
        console.error("Error resetting fills:", err);
      }
    } catch (highlightErr) {
      console.error("Error highlighting text node:", highlightErr);
      // Continue anyway, highlighting is just visual feedback
    }

    return safeTextNode;
  } catch (nodeErr) {
    console.error("Error processing text node:", nodeErr);
    return null;
  }
}

// A delay function that returns a promise
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Keep the original findTextNodes for backward compatibility
async function findTextNodes(
  node: BaseNode,
  parentPath: string[] = [],
  depth = 0,
  textNodes: SafeTextNode[] = [],
): Promise<void> {
  // Skip invisible nodes
  if ("visible" in node && node.visible === false) return;

  // Get the path to this node including its name
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];

  if (node.type === "TEXT") {
    try {
      // Safely extract font information to avoid Symbol serialization issues
      let fontFamily = "";
      let fontStyle = "";

      if (node.fontName) {
        if (typeof node.fontName === "object") {
          if ("family" in node.fontName) fontFamily = node.fontName.family;
          if ("style" in node.fontName) fontStyle = node.fontName.style;
        }
      }

      // Create a safe representation of the text node with only serializable properties
      const safeTextNode = {
        id: node.id,
        name: node.name || "Text",
        type: node.type,
        characters: node.characters,
        fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        x: typeof node.x === "number" ? node.x : 0,
        y: typeof node.y === "number" ? node.y : 0,
        width: typeof node.width === "number" ? node.width : 0,
        height: typeof node.height === "number" ? node.height : 0,
        path: nodePath.join(" > "),
        depth: depth,
      };

      // Only highlight the node if it's not being done via API
      try {
        // Safe way to create a temporary highlight without causing serialization issues
        const originalFills = JSON.parse(JSON.stringify(node.fills));
        node.fills = [
          {
            type: "SOLID",
            color: { r: 1, g: 0.5, b: 0 },
            opacity: 0.3,
          },
        ];

        // Promise-based delay instead of setTimeout
        await delay(500);

        try {
          node.fills = originalFills;
        } catch (err) {
          console.error("Error resetting fills:", err);
        }
      } catch (highlightErr) {
        console.error("Error highlighting text node:", highlightErr);
        // Continue anyway, highlighting is just visual feedback
      }

      textNodes.push(safeTextNode);
    } catch (nodeErr) {
      console.error("Error processing text node:", nodeErr);
      // Skip this node but continue with others
    }
  }

  // Recursively process children of container nodes
  if ("children" in node) {
    for (const child of node.children) {
      await findTextNodes(child, nodePath, depth + 1, textNodes);
    }
  }
}

// Replace text in a specific node
async function setMultipleTextContents(params: SetMultipleTextContentsParams) {
  const { nodeId, text } = params || {};
  const commandId = params.commandId || generateCommandId();

  if (!nodeId || !text || !Array.isArray(text)) {
    const errorMsg = "Missing required parameters: nodeId and text array";

    // Send error progress update
    sendProgressUpdate(commandId, "set_multiple_text_contents", "error", 0, 0, 0, errorMsg, {
      error: errorMsg,
    });

    throw new Error(errorMsg);
  }

  console.log(
    `Starting text replacement for node: ${nodeId} with ${text.length} text replacements`,
  );

  // Send started progress update
  sendProgressUpdate(
    commandId,
    "set_multiple_text_contents",
    "started",
    0,
    text.length,
    0,
    `Starting text replacement for ${text.length} nodes`,
    { totalReplacements: text.length },
  );

  // Define the results array and counters
  const results: TextReplacementResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  // Split text replacements into chunks of 5
  const CHUNK_SIZE = 5;
  const chunks: TextReplacement[][] = [];

  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  console.log(`Split ${text.length} replacements into ${chunks.length} chunks`);

  // Send chunking info update
  sendProgressUpdate(
    commandId,
    "set_multiple_text_contents",
    "in_progress",
    5, // 5% progress for planning phase
    text.length,
    0,
    `Preparing to replace text in ${text.length} nodes using ${chunks.length} chunks`,
    {
      totalReplacements: text.length,
      chunks: chunks.length,
      chunkSize: CHUNK_SIZE,
    },
  );

  // Process each chunk sequentially
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    console.log(
      `Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} replacements`,
    );

    // Send chunk processing start update
    sendProgressUpdate(
      commandId,
      "set_multiple_text_contents",
      "in_progress",
      Math.round(5 + (chunkIndex / chunks.length) * 90), // 5-95% for processing
      text.length,
      successCount + failureCount,
      `Processing text replacements chunk ${chunkIndex + 1}/${chunks.length}`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount,
      },
    );

    // Process replacements within a chunk in parallel
    const chunkPromises: Array<Promise<TextReplacementResult>> = chunk.map(
      async (replacement): Promise<TextReplacementResult> => {
        if (!replacement.nodeId || replacement.text === undefined) {
          console.error(`Missing nodeId or text for replacement`);
          return {
            success: false,
            nodeId: replacement.nodeId || "unknown",
            error: "Missing nodeId or text in replacement entry",
          };
        }

        try {
          console.log(`Attempting to replace text in node: ${replacement.nodeId}`);

          // Get the text node to update (just to check it exists and get original text)
          const textNode = await figma.getNodeByIdAsync(replacement.nodeId);

          if (!textNode) {
            console.error(`Text node not found: ${replacement.nodeId}`);
            return {
              success: false,
              nodeId: replacement.nodeId,
              error: `Node not found: ${replacement.nodeId}`,
            };
          }

          if (textNode.type !== "TEXT") {
            console.error(
              `Node is not a text node: ${replacement.nodeId} (type: ${textNode.type})`,
            );
            return {
              success: false,
              nodeId: replacement.nodeId,
              error: `Node is not a text node: ${replacement.nodeId} (type: ${textNode.type})`,
            };
          }

          // Save original text for the result
          const originalText = textNode.characters;
          console.log(`Original text: "${originalText}"`);
          console.log(`Will translate to: "${replacement.text}"`);

          // Highlight the node before changing text
          let originalFills;
          try {
            // Save original fills for restoration later
            originalFills = JSON.parse(JSON.stringify(textNode.fills));
            // Apply highlight color (orange with 30% opacity)
            textNode.fills = [
              {
                type: "SOLID",
                color: { r: 1, g: 0.5, b: 0 },
                opacity: 0.3,
              },
            ];
          } catch (highlightErr) {
            console.error(`Error highlighting text node: ${errorMessage(highlightErr)}`);
            // Continue anyway, highlighting is just visual feedback
          }

          // Use the existing setTextContent function to handle font loading and text setting
          await setTextContent({
            nodeId: replacement.nodeId,
            text: replacement.text,
          });

          // Keep highlight for a moment after text change, then restore original fills
          if (originalFills) {
            try {
              // Use delay function for consistent timing
              await delay(500);
              textNode.fills = originalFills;
            } catch (restoreErr) {
              console.error(`Error restoring fills: ${errorMessage(restoreErr)}`);
            }
          }

          console.log(`Successfully replaced text in node: ${replacement.nodeId}`);
          return {
            success: true,
            nodeId: replacement.nodeId,
            originalText: originalText,
            translatedText: replacement.text,
          };
        } catch (error) {
          console.error(
            `Error replacing text in node ${replacement.nodeId}: ${errorMessage(error)}`,
          );
          return {
            success: false,
            nodeId: replacement.nodeId,
            error: `Error applying replacement: ${errorMessage(error)}`,
          };
        }
      },
    );

    // Wait for all replacements in this chunk to complete
    const chunkResults = await Promise.all(chunkPromises);

    // Process results for this chunk
    chunkResults.forEach((result) => {
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
      results.push(result);
    });

    // Send chunk processing complete update with partial results
    sendProgressUpdate(
      commandId,
      "set_multiple_text_contents",
      "in_progress",
      Math.round(5 + ((chunkIndex + 1) / chunks.length) * 90), // 5-95% for processing
      text.length,
      successCount + failureCount,
      `Completed chunk ${chunkIndex + 1}/${
        chunks.length
      }. ${successCount} successful, ${failureCount} failed so far.`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount,
        chunkResults: chunkResults,
      },
    );

    // Add a small delay between chunks to avoid overloading Figma
    if (chunkIndex < chunks.length - 1) {
      console.log("Pausing between chunks to avoid overloading Figma...");
      await delay(1000); // 1 second delay between chunks
    }
  }

  console.log(`Replacement complete: ${successCount} successful, ${failureCount} failed`);

  // Send completed progress update
  sendProgressUpdate(
    commandId,
    "set_multiple_text_contents",
    "completed",
    100,
    text.length,
    successCount + failureCount,
    `Text replacement complete: ${successCount} successful, ${failureCount} failed`,
    {
      totalReplacements: text.length,
      replacementsApplied: successCount,
      replacementsFailed: failureCount,
      completedInChunks: chunks.length,
      results: results,
    },
  );

  return {
    success: successCount > 0,
    nodeId: nodeId,
    replacementsApplied: successCount,
    replacementsFailed: failureCount,
    totalReplacements: text.length,
    results: results,
    completedInChunks: chunks.length,
    commandId,
  };
}

// Function to generate simple UUIDs for command IDs
function generateCommandId() {
  return (
    "cmd_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function getAnnotations(params: GetAnnotationsParams) {
  try {
    const { nodeId, includeCategories = true } = params;

    // Get categories first if needed
    let categoriesMap: Record<string, AnnotationCategory> = {};
    if (includeCategories) {
      const categories =
        (await figma.annotations.getAnnotationCategoriesAsync()) as AnnotationCategory[];
      categoriesMap = categories.reduce<Record<string, AnnotationCategory>>((map, category) => {
        map[category.id] = category;
        return map;
      }, {});
    }

    if (nodeId) {
      // Get annotations for a specific node
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      const nodeType = node.type;
      if (!hasAnnotations(node)) {
        throw new Error(`Node type ${nodeType} does not support annotations`);
      }

      // Collect annotations from this node and all its descendants
      const mergedAnnotations: Array<{ nodeId: string; annotation: Annotation }> = [];
      const collect = async (n: BaseNode): Promise<void> => {
        if ("annotations" in n && n.annotations && n.annotations.length > 0) {
          for (const a of n.annotations) {
            mergedAnnotations.push({ nodeId: n.id, annotation: a });
          }
        }
        if ("children" in n) {
          for (const child of n.children) {
            await collect(child);
          }
        }
      };
      await collect(node);

      const result: Record<string, unknown> = {
        nodeId: node.id,
        name: node.name,
        annotations: mergedAnnotations,
      };

      if (includeCategories) {
        result.categories = Object.values(categoriesMap);
      }

      return result;
    } else {
      // Get all annotations in the current page
      const annotations: Array<{
        nodeId: string;
        name: string;
        annotations: ReadonlyArray<Annotation>;
      }> = [];
      const processNode = async (node: BaseNode): Promise<void> => {
        if ("annotations" in node && node.annotations && node.annotations.length > 0) {
          annotations.push({
            nodeId: node.id,
            name: node.name,
            annotations: node.annotations,
          });
        }
        if ("children" in node) {
          for (const child of node.children) {
            await processNode(child);
          }
        }
      };

      // Start from current page
      await processNode(figma.currentPage);

      const result: Record<string, unknown> = {
        annotatedNodes: annotations,
      };

      if (includeCategories) {
        result.categories = Object.values(categoriesMap);
      }

      return result;
    }
  } catch (error) {
    console.error("Error in getAnnotations:", error);
    throw error;
  }
}

async function setAnnotation(params: SetAnnotationParams) {
  try {
    console.log("=== setAnnotation Debug Start ===");
    console.log("Input params:", JSON.stringify(params, null, 2));

    const { nodeId, annotationId, labelMarkdown, categoryId, properties } = params;

    // Validate required parameters
    if (!nodeId) {
      console.error("Validation failed: Missing nodeId");
      return { success: false, error: "Missing nodeId" };
    }

    if (!labelMarkdown) {
      console.error("Validation failed: Missing labelMarkdown");
      return { success: false, error: "Missing labelMarkdown" };
    }

    console.log("Attempting to get node:", nodeId);
    // Get and validate node
    const node = await figma.getNodeByIdAsync(nodeId);
    console.log("Node lookup result:", {
      id: nodeId,
      found: !!node,
      type: node ? node.type : undefined,
      name: node ? node.name : undefined,
      hasAnnotations: node ? "annotations" in node : false,
    });

    if (!node) {
      console.error("Node lookup failed:", nodeId);
      return { success: false, error: `Node not found: ${nodeId}` };
    }

    // Validate node supports annotations
    const nodeType = node.type;
    const resolvedNodeId = node.id;
    if (!hasAnnotations(node)) {
      console.error("Node annotation support check failed:", {
        nodeType,
        nodeId: resolvedNodeId,
      });
      return {
        success: false,
        error: `Node type ${nodeType} does not support annotations`,
      };
    }

    // Annotation fields are readonly in the Figma typings, so construct the
    // complete value up front instead of mutating it afterward.
    const newAnnotation: Annotation = {
      labelMarkdown,
      ...(categoryId ? { categoryId } : {}),
      ...(properties && properties.length > 0 ? { properties } : {}),
    };

    if (categoryId) {
      console.log("Adding categoryId to annotation:", categoryId);
    }
    if (properties && properties.length > 0) {
      console.log("Adding properties to annotation:", JSON.stringify(properties, null, 2));
    }

    // Log current annotations before update
    console.log("Current node annotations:", node.annotations);

    // Overwrite annotations
    console.log("Setting new annotation:", JSON.stringify(newAnnotation, null, 2));
    node.annotations = [newAnnotation];

    // Verify the update
    console.log("Updated node annotations:", node.annotations);
    console.log("=== setAnnotation Debug End ===");

    return {
      success: true,
      nodeId: node.id,
      name: node.name,
      annotations: node.annotations,
    };
  } catch (error) {
    console.error("=== setAnnotation Error ===");
    console.error("Error details:", {
      message: errorMessage(error),
      stack: errorStack(error),
      params: JSON.stringify(params, null, 2),
    });
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Scan for nodes with specific types within a node
 * @param {Object} params - Parameters object
 * @param {string} params.nodeId - ID of the node to scan within
 * @param {Array<string>} params.types - Array of node types to find (e.g. ['COMPONENT', 'FRAME'])
 * @returns {Object} - Object containing found nodes
 */
async function scanNodesByTypes(params: ScanNodesByTypesParams) {
  console.log(`Starting to scan nodes by types from node ID: ${params.nodeId}`);
  const { nodeId, types = [] } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (types.length === 0) {
    throw new Error("No types specified to search for");
  }

  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Simple implementation without chunking
  const matchingNodes: MatchingNode[] = [];

  // Send a single progress update to notify start
  const commandId = params.commandId || generateCommandId();
  sendProgressUpdate(
    commandId,
    "scan_nodes_by_types",
    "started",
    0,
    1,
    0,
    `Starting scan of node "${node.name || nodeId}" for types: ${types.join(", ")}`,
    null,
  );

  // Recursively find nodes with specified types
  await findNodesByTypes(node, types, matchingNodes);

  // Send completion update
  sendProgressUpdate(
    commandId,
    "scan_nodes_by_types",
    "completed",
    100,
    matchingNodes.length,
    matchingNodes.length,
    `Scan complete. Found ${matchingNodes.length} matching nodes.`,
    { matchingNodes },
  );

  return {
    success: true,
    message: `Found ${matchingNodes.length} matching nodes.`,
    count: matchingNodes.length,
    matchingNodes: matchingNodes,
    searchedTypes: types,
  };
}

/**
 * Helper function to recursively find nodes with specific types
 * @param {SceneNode} node - The root node to start searching from
 * @param {Array<string>} types - Array of node types to find
 * @param {Array} matchingNodes - Array to store found nodes
 */
async function findNodesByTypes(
  node: BaseNode,
  types: string[],
  matchingNodes: MatchingNode[] = [],
): Promise<void> {
  // Skip invisible nodes
  if ("visible" in node && node.visible === false) return;

  // Check if this node is one of the specified types
  if (types.includes(node.type)) {
    // Create a minimal representation with just ID, type and bbox
    const sceneNode = isSceneNode(node) ? node : null;
    matchingNodes.push({
      id: node.id,
      name: node.name || `Unnamed ${node.type}`,
      type: node.type,
      // Basic bounding box info
      bbox: {
        x: sceneNode?.x ?? 0,
        y: sceneNode?.y ?? 0,
        width: sceneNode?.width ?? 0,
        height: sceneNode?.height ?? 0,
      },
    });
  }

  // Recursively process children of container nodes
  if ("children" in node) {
    for (const child of node.children) {
      await findNodesByTypes(child, types, matchingNodes);
    }
  }
}

// Set multiple annotations with async progress updates
async function setMultipleAnnotations(params: SetMultipleAnnotationsParams) {
  console.log("=== setMultipleAnnotations Debug Start ===");
  console.log("Input params:", JSON.stringify(params, null, 2));

  const { nodeId, annotations } = params;

  if (!annotations || annotations.length === 0) {
    console.error("Validation failed: No annotations provided");
    return { success: false, error: "No annotations provided" };
  }

  console.log(`Processing ${annotations.length} annotations for node ${nodeId}`);

  const results: AnnotationApplyResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  // Process annotations sequentially
  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];
    console.log(
      `\nProcessing annotation ${i + 1}/${annotations.length}:`,
      JSON.stringify(annotation, null, 2),
    );

    try {
      console.log("Calling setAnnotation with params:", {
        nodeId: annotation.nodeId,
        labelMarkdown: annotation.labelMarkdown,
        categoryId: annotation.categoryId,
        properties: annotation.properties,
      });

      const result = await setAnnotation({
        nodeId: annotation.nodeId,
        labelMarkdown: annotation.labelMarkdown,
        categoryId: annotation.categoryId,
        properties: annotation.properties,
      });

      console.log("setAnnotation result:", JSON.stringify(result, null, 2));

      if (result.success) {
        successCount++;
        results.push({ success: true, nodeId: annotation.nodeId });
        console.log(`✓ Annotation ${i + 1} applied successfully`);
      } else {
        failureCount++;
        results.push({
          success: false,
          nodeId: annotation.nodeId,
          error: result.error,
        });
        console.error(`✗ Annotation ${i + 1} failed:`, result.error);
      }
    } catch (error) {
      failureCount++;
      const errorResult = {
        success: false,
        nodeId: annotation.nodeId,
        error: errorMessage(error),
      };
      results.push(errorResult);
      console.error(`✗ Annotation ${i + 1} failed with error:`, error);
      console.error("Error details:", {
        message: errorMessage(error),
        stack: errorStack(error),
      });
    }
  }

  const summary = {
    success: successCount > 0,
    annotationsApplied: successCount,
    annotationsFailed: failureCount,
    totalAnnotations: annotations.length,
    results: results,
  };

  console.log("\n=== setMultipleAnnotations Summary ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log("=== setMultipleAnnotations Debug End ===");

  return summary;
}

async function deleteMultipleNodes(params: NodeIdsParams) {
  const { nodeIds } = params || {};
  const commandId = params?.commandId || generateCommandId();

  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length === 0) {
    const errorMsg = "Missing or invalid nodeIds parameter";
    sendProgressUpdate(commandId, "delete_multiple_nodes", "error", 0, 0, 0, errorMsg, {
      error: errorMsg,
    });
    throw new Error(errorMsg);
  }

  console.log(`Starting deletion of ${nodeIds.length} nodes`);

  // Send started progress update
  sendProgressUpdate(
    commandId,
    "delete_multiple_nodes",
    "started",
    0,
    nodeIds.length,
    0,
    `Starting deletion of ${nodeIds.length} nodes`,
    { totalNodes: nodeIds.length },
  );

  const results: DeleteNodeResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  // Process nodes in chunks of 5 to avoid overwhelming Figma
  const CHUNK_SIZE = 5;
  const chunks: string[][] = [];

  for (let i = 0; i < nodeIds.length; i += CHUNK_SIZE) {
    chunks.push(nodeIds.slice(i, i + CHUNK_SIZE));
  }

  console.log(`Split ${nodeIds.length} deletions into ${chunks.length} chunks`);

  // Send chunking info update
  sendProgressUpdate(
    commandId,
    "delete_multiple_nodes",
    "in_progress",
    5,
    nodeIds.length,
    0,
    `Preparing to delete ${nodeIds.length} nodes using ${chunks.length} chunks`,
    {
      totalNodes: nodeIds.length,
      chunks: chunks.length,
      chunkSize: CHUNK_SIZE,
    },
  );

  // Process each chunk sequentially
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} nodes`);

    // Send chunk processing start update
    sendProgressUpdate(
      commandId,
      "delete_multiple_nodes",
      "in_progress",
      Math.round(5 + (chunkIndex / chunks.length) * 90),
      nodeIds.length,
      successCount + failureCount,
      `Processing deletion chunk ${chunkIndex + 1}/${chunks.length}`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount,
      },
    );

    // Process deletions within a chunk in parallel
    const chunkPromises: Array<Promise<DeleteNodeResult>> = chunk.map(
      async (nodeId): Promise<DeleteNodeResult> => {
        try {
          const node = await figma.getNodeByIdAsync(nodeId);

          if (!node) {
            console.error(`Node not found: ${nodeId}`);
            return {
              success: false,
              nodeId: nodeId,
              error: `Node not found: ${nodeId}`,
            };
          }

          // Save node info before deleting
          const nodeInfo = {
            id: node.id,
            name: node.name,
            type: node.type,
          };

          // Delete the node
          node.remove();

          console.log(`Successfully deleted node: ${nodeId}`);
          return {
            success: true,
            nodeId: nodeId,
            nodeInfo: nodeInfo,
          };
        } catch (error) {
          console.error(`Error deleting node ${nodeId}: ${errorMessage(error)}`);
          return {
            success: false,
            nodeId: nodeId,
            error: errorMessage(error),
          };
        }
      },
    );

    // Wait for all deletions in this chunk to complete
    const chunkResults = await Promise.all(chunkPromises);

    // Process results for this chunk
    chunkResults.forEach((result) => {
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
      results.push(result);
    });

    // Send chunk processing complete update
    sendProgressUpdate(
      commandId,
      "delete_multiple_nodes",
      "in_progress",
      Math.round(5 + ((chunkIndex + 1) / chunks.length) * 90),
      nodeIds.length,
      successCount + failureCount,
      `Completed chunk ${chunkIndex + 1}/${
        chunks.length
      }. ${successCount} successful, ${failureCount} failed so far.`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount,
        chunkResults: chunkResults,
      },
    );

    // Add a small delay between chunks
    if (chunkIndex < chunks.length - 1) {
      console.log("Pausing between chunks...");
      await delay(1000);
    }
  }

  console.log(`Deletion complete: ${successCount} successful, ${failureCount} failed`);

  // Send completed progress update
  sendProgressUpdate(
    commandId,
    "delete_multiple_nodes",
    "completed",
    100,
    nodeIds.length,
    successCount + failureCount,
    `Node deletion complete: ${successCount} successful, ${failureCount} failed`,
    {
      totalNodes: nodeIds.length,
      nodesDeleted: successCount,
      nodesFailed: failureCount,
      completedInChunks: chunks.length,
      results: results,
    },
  );

  return {
    success: successCount > 0,
    nodesDeleted: successCount,
    nodesFailed: failureCount,
    totalNodes: nodeIds.length,
    results: results,
    completedInChunks: chunks.length,
    commandId,
  };
}

// Implementation for getInstanceOverrides function
async function getInstanceOverrides(instanceNode: BaseNode | null = null) {
  console.log("=== getInstanceOverrides called ===");

  let sourceInstance: InstanceNode | null = null;

  // Check if an instance node was passed directly
  if (instanceNode) {
    console.log("Using provided instance node");

    // Validate that the provided node is an instance
    if (instanceNode.type !== "INSTANCE") {
      console.error("Provided node is not an instance");
      figma.notify("Provided node is not a component instance");
      return { success: false, message: "Provided node is not a component instance" };
    }

    sourceInstance = instanceNode;
  } else {
    // No node provided, use selection
    console.log("No node provided, using current selection");

    // Get the current selection
    const selection = figma.currentPage.selection;

    // Check if there's anything selected
    if (selection.length === 0) {
      console.log("No nodes selected");
      figma.notify("Please select at least one instance");
      return { success: false, message: "No nodes selected" };
    }

    // Filter for instances in the selection
    const instances = selection.filter(
      (node: SceneNode): node is InstanceNode => node.type === "INSTANCE",
    );

    if (instances.length === 0) {
      console.log("No instances found in selection");
      figma.notify("Please select at least one component instance");
      return { success: false, message: "No instances found in selection" };
    }

    // Take the first instance from the selection
    sourceInstance = instances[0];
  }

  try {
    console.log(`Getting instance information:`);
    console.log(sourceInstance);

    // Get component overrides and main component
    const overrides = sourceInstance.overrides || [];
    console.log(`  Raw Overrides:`, overrides);

    // Get main component
    const mainComponent = await sourceInstance.getMainComponentAsync();
    if (!mainComponent) {
      console.error("Failed to get main component");
      figma.notify("Failed to get main component");
      return { success: false, message: "Failed to get main component" };
    }

    // return data to MCP server
    const returnData = {
      success: true,
      message: `Got component information from "${sourceInstance.name}" for overrides.length: ${overrides.length}`,
      sourceInstanceId: sourceInstance.id,
      mainComponentId: mainComponent.id,
      overridesCount: overrides.length,
    };

    console.log("Data to return to MCP server:", returnData);
    figma.notify(`Got component information from "${sourceInstance.name}"`);

    return returnData;
  } catch (error) {
    console.error("Error in getInstanceOverrides:", error);
    figma.notify(`Error: ${errorMessage(error)}`);
    return {
      success: false,
      message: `Error: ${errorMessage(error)}`,
    };
  }
}

/**
 * Helper function to validate and get target instances
 * @param {string[]} targetNodeIds - Array of instance node IDs
 * @returns {instanceNode[]} targetInstances - Array of target instances
 */
async function getValidTargetInstances(targetNodeIds: string[]): Promise<TargetInstancesResult> {
  const targetInstances: InstanceNode[] = [];

  // Handle array of instances or single instance
  if (Array.isArray(targetNodeIds)) {
    if (targetNodeIds.length === 0) {
      return { success: false, message: "No instances provided" };
    }
    for (const targetNodeId of targetNodeIds) {
      const targetNode = await figma.getNodeByIdAsync(targetNodeId);
      if (targetNode && targetNode.type === "INSTANCE") {
        targetInstances.push(targetNode);
      }
    }
    if (targetInstances.length === 0) {
      return { success: false, message: "No valid instances provided" };
    }
  } else {
    return { success: false, message: "Invalid target node IDs provided" };
  }

  return { success: true, message: "Valid target instances provided", targetInstances };
}

/**
 * Helper function to validate and get saved override data
 * @param {string} sourceInstanceId - Source instance ID
 * @returns {Promise<Object>} - Validation result with source instance data or error
 */
async function getSourceInstanceData(sourceInstanceId: string): Promise<SourceInstanceDataResult> {
  if (!sourceInstanceId) {
    return { success: false, message: "Missing source instance ID" };
  }

  // Get source instance by ID
  const sourceInstance = await figma.getNodeByIdAsync(sourceInstanceId);
  if (!sourceInstance) {
    return {
      success: false,
      message: "Source instance not found. The original instance may have been deleted.",
    };
  }

  // Verify it's an instance
  if (sourceInstance.type !== "INSTANCE") {
    return {
      success: false,
      message: "Source node is not a component instance.",
    };
  }

  // Get main component
  const mainComponent = await sourceInstance.getMainComponentAsync();
  if (!mainComponent) {
    return {
      success: false,
      message: "Failed to get main component from source instance.",
    };
  }

  return {
    success: true,
    sourceInstance,
    mainComponent,
    overrides: sourceInstance.overrides || [],
  };
}

/**
 * Sets saved overrides to the selected component instance(s)
 * @param {InstanceNode[] | null} targetInstances - Array of instance nodes to set overrides to
 * @param {Object} sourceResult - Source instance data from getSourceInstanceData
 * @returns {Promise<Object>} - Result of the set operation
 */
async function setInstanceOverrides(
  targetInstances: InstanceNode[],
  sourceResult: Extract<SourceInstanceDataResult, { success: true }>,
) {
  try {
    const { sourceInstance, mainComponent, overrides } = sourceResult;

    console.log(
      `Processing ${targetInstances.length} instances with ${overrides.length} overrides`,
    );
    console.log(`Source instance: ${sourceInstance.id}, Main component: ${mainComponent.id}`);
    console.log(`Overrides:`, overrides);

    // Process all instances
    const results: InstanceOverrideResult[] = [];
    let totalAppliedCount = 0;

    for (const targetInstance of targetInstances) {
      try {
        // // Skip if trying to apply to the source instance itself
        // if (targetInstance.id === sourceInstance.id) {
        //   console.log(`Skipping source instance itself: ${targetInstance.id}`);
        //   results.push({
        //     success: false,
        //     instanceId: targetInstance.id,
        //     instanceName: targetInstance.name,
        //     message: "This is the source instance itself, skipping"
        //   });
        //   continue;
        // }

        // Swap component
        try {
          targetInstance.swapComponent(mainComponent);
          console.log(`Swapped component for instance "${targetInstance.name}"`);
        } catch (error) {
          console.error(`Error swapping component for instance "${targetInstance.name}":`, error);
          results.push({
            success: false,
            instanceId: targetInstance.id,
            instanceName: targetInstance.name,
            message: `Error: ${errorMessage(error)}`,
          });
        }

        // Prepare overrides by replacing node IDs
        let appliedCount = 0;

        // Apply each override
        for (const override of overrides) {
          // Skip if no ID or overriddenFields
          if (
            !override.id ||
            !override.overriddenFields ||
            override.overriddenFields.length === 0
          ) {
            continue;
          }

          // Replace source instance ID with target instance ID in the node path
          const overrideNodeId = override.id.replace(sourceInstance.id, targetInstance.id);
          const overrideNode = await figma.getNodeByIdAsync(overrideNodeId);

          if (!overrideNode) {
            console.log(`Override node not found: ${overrideNodeId}`);
            continue;
          }

          // Get source node to copy properties from
          const sourceNode = await figma.getNodeByIdAsync(override.id);
          if (!sourceNode) {
            console.log(`Source node not found: ${override.id}`);
            continue;
          }

          // Apply each overridden field
          let fieldApplied = false;
          for (const field of override.overriddenFields) {
            try {
              if (field === "componentProperties") {
                if (sourceNode.type === "INSTANCE" && overrideNode.type === "INSTANCE") {
                  const properties: Record<string, string | boolean> = {};
                  for (const key in sourceNode.componentProperties) {
                    properties[key] = sourceNode.componentProperties[key].value;
                  }
                  overrideNode.setProperties(properties);
                  fieldApplied = true;
                }
              } else if (
                field === "characters" &&
                sourceNode.type === "TEXT" &&
                overrideNode.type === "TEXT"
              ) {
                // For text nodes, need to load a concrete font first.
                if (overrideNode.fontName !== figma.mixed) {
                  await figma.loadFontAsync(overrideNode.fontName);
                }
                overrideNode.characters = sourceNode.characters;
                fieldApplied = true;
              } else if (field in overrideNode && field in sourceNode) {
                // NodeChangeProperty is intentionally dynamic. Keep the dynamic assignment
                // at this protocol boundary instead of weakening the rest of the file.
                const targetRecord = overrideNode as unknown as Record<string, unknown>;
                const sourceRecord = sourceNode as unknown as Record<string, unknown>;
                targetRecord[field] = sourceRecord[field];
                fieldApplied = true;
              }
            } catch (fieldError) {
              console.error(`Error applying field ${field}:`, fieldError);
            }
          }

          if (fieldApplied) {
            appliedCount++;
          }
        }

        if (appliedCount > 0) {
          totalAppliedCount += appliedCount;
          results.push({
            success: true,
            instanceId: targetInstance.id,
            instanceName: targetInstance.name,
            appliedCount,
          });
          console.log(`Applied ${appliedCount} overrides to "${targetInstance.name}"`);
        } else {
          results.push({
            success: false,
            instanceId: targetInstance.id,
            instanceName: targetInstance.name,
            message: "No overrides were applied",
          });
        }
      } catch (instanceError) {
        console.error(`Error processing instance "${targetInstance.name}":`, instanceError);
        results.push({
          success: false,
          instanceId: targetInstance.id,
          instanceName: targetInstance.name,
          message: `Error: ${errorMessage(instanceError)}`,
        });
      }
    }

    // Return results
    if (totalAppliedCount > 0) {
      const instanceCount = results.filter((r) => r.success).length;
      const message = `Applied ${totalAppliedCount} overrides to ${instanceCount} instances`;
      figma.notify(message);
      return {
        success: true,
        message,
        totalCount: totalAppliedCount,
        results,
      };
    } else {
      const message = "No overrides applied to any instance";
      figma.notify(message);
      return { success: false, message, results };
    }
  } catch (error) {
    console.error("Error in setInstanceOverrides:", error);
    const message = `Error: ${errorMessage(error)}`;
    figma.notify(message);
    return { success: false, message };
  }
}

async function setLayoutMode(params: LayoutModeParams) {
  const { nodeId, layoutMode = "NONE", layoutWrap = "NO_WRAP" } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  // Get the target node
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Check if node is a frame or component that supports layoutMode
  if (
    node.type !== "FRAME" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "INSTANCE"
  ) {
    throw new Error(`Node type ${node.type} does not support layoutMode`);
  }

  // Set layout mode
  node.layoutMode = layoutMode;

  // Set layoutWrap if applicable
  if (layoutMode !== "NONE") {
    node.layoutWrap = layoutWrap;
  }

  return {
    id: node.id,
    name: node.name,
    layoutMode: node.layoutMode,
    layoutWrap: node.layoutWrap,
  };
}

async function setPadding(params: PaddingParams) {
  const { nodeId, paddingTop, paddingRight, paddingBottom, paddingLeft } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  // Get the target node
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Check if node is a frame or component that supports padding
  if (
    node.type !== "FRAME" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "INSTANCE"
  ) {
    throw new Error(`Node type ${node.type} does not support padding`);
  }

  // Check if the node has auto-layout enabled
  if (node.layoutMode === "NONE") {
    throw new Error("Padding can only be set on auto-layout frames (layoutMode must not be NONE)");
  }

  // Set padding values if provided
  if (paddingTop !== undefined) node.paddingTop = paddingTop;
  if (paddingRight !== undefined) node.paddingRight = paddingRight;
  if (paddingBottom !== undefined) node.paddingBottom = paddingBottom;
  if (paddingLeft !== undefined) node.paddingLeft = paddingLeft;

  return {
    id: node.id,
    name: node.name,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
  };
}

async function setAxisAlign(params: AxisAlignParams) {
  const { nodeId, primaryAxisAlignItems, counterAxisAlignItems } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  // Get the target node
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Check if node is a frame or component that supports axis alignment
  if (
    node.type !== "FRAME" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "INSTANCE"
  ) {
    throw new Error(`Node type ${node.type} does not support axis alignment`);
  }

  // Check if the node has auto-layout enabled
  if (node.layoutMode === "NONE") {
    throw new Error(
      "Axis alignment can only be set on auto-layout frames (layoutMode must not be NONE)",
    );
  }

  // Validate and set primaryAxisAlignItems if provided
  if (primaryAxisAlignItems !== undefined) {
    if (!["MIN", "MAX", "CENTER", "SPACE_BETWEEN"].includes(primaryAxisAlignItems)) {
      throw new Error(
        "Invalid primaryAxisAlignItems value. Must be one of: MIN, MAX, CENTER, SPACE_BETWEEN",
      );
    }
    node.primaryAxisAlignItems = primaryAxisAlignItems;
  }

  // Validate and set counterAxisAlignItems if provided
  if (counterAxisAlignItems !== undefined) {
    if (!["MIN", "MAX", "CENTER", "BASELINE"].includes(counterAxisAlignItems)) {
      throw new Error(
        "Invalid counterAxisAlignItems value. Must be one of: MIN, MAX, CENTER, BASELINE",
      );
    }
    // BASELINE is only valid for horizontal layout
    if (counterAxisAlignItems === "BASELINE" && node.layoutMode !== "HORIZONTAL") {
      throw new Error("BASELINE alignment is only valid for horizontal auto-layout frames");
    }
    node.counterAxisAlignItems = counterAxisAlignItems;
  }

  return {
    id: node.id,
    name: node.name,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    layoutMode: node.layoutMode,
  };
}

async function setLayoutSizing(params: LayoutSizingParams) {
  const { nodeId, layoutSizingHorizontal, layoutSizingVertical } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  // Get the target node
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Check if node is a frame or component that supports layout sizing
  if (
    node.type !== "FRAME" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "INSTANCE"
  ) {
    throw new Error(`Node type ${node.type} does not support layout sizing`);
  }

  // Check if the node has auto-layout enabled
  if (node.layoutMode === "NONE") {
    throw new Error(
      "Layout sizing can only be set on auto-layout frames (layoutMode must not be NONE)",
    );
  }

  // Validate and set layoutSizingHorizontal if provided
  if (layoutSizingHorizontal !== undefined) {
    if (!["FIXED", "HUG", "FILL"].includes(layoutSizingHorizontal)) {
      throw new Error("Invalid layoutSizingHorizontal value. Must be one of: FIXED, HUG, FILL");
    }
    // HUG is only valid on auto-layout frames and text nodes
    if (layoutSizingHorizontal === "HUG" && !["FRAME", "TEXT"].includes(node.type)) {
      throw new Error("HUG sizing is only valid on auto-layout frames and text nodes");
    }
    // FILL is only valid on auto-layout children
    if (
      layoutSizingHorizontal === "FILL" &&
      (!node.parent || !("layoutMode" in node.parent) || node.parent.layoutMode === "NONE")
    ) {
      throw new Error("FILL sizing is only valid on auto-layout children");
    }
    node.layoutSizingHorizontal = layoutSizingHorizontal;
  }

  // Validate and set layoutSizingVertical if provided
  if (layoutSizingVertical !== undefined) {
    if (!["FIXED", "HUG", "FILL"].includes(layoutSizingVertical)) {
      throw new Error("Invalid layoutSizingVertical value. Must be one of: FIXED, HUG, FILL");
    }
    // HUG is only valid on auto-layout frames and text nodes
    if (layoutSizingVertical === "HUG" && !["FRAME", "TEXT"].includes(node.type)) {
      throw new Error("HUG sizing is only valid on auto-layout frames and text nodes");
    }
    // FILL is only valid on auto-layout children
    if (
      layoutSizingVertical === "FILL" &&
      (!node.parent || !("layoutMode" in node.parent) || node.parent.layoutMode === "NONE")
    ) {
      throw new Error("FILL sizing is only valid on auto-layout children");
    }
    node.layoutSizingVertical = layoutSizingVertical;
  }

  return {
    id: node.id,
    name: node.name,
    layoutSizingHorizontal: node.layoutSizingHorizontal,
    layoutSizingVertical: node.layoutSizingVertical,
    layoutMode: node.layoutMode,
  };
}

async function setItemSpacing(params: ItemSpacingParams) {
  const { nodeId, itemSpacing, counterAxisSpacing } = params || {};

  // Validate that at least one spacing parameter is provided
  if (itemSpacing === undefined && counterAxisSpacing === undefined) {
    throw new Error("At least one of itemSpacing or counterAxisSpacing must be provided");
  }

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  // Get the target node
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // Check if node is a frame or component that supports item spacing
  if (
    node.type !== "FRAME" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "INSTANCE"
  ) {
    throw new Error(`Node type ${node.type} does not support item spacing`);
  }

  // Check if the node has auto-layout enabled
  if (node.layoutMode === "NONE") {
    throw new Error(
      "Item spacing can only be set on auto-layout frames (layoutMode must not be NONE)",
    );
  }

  // Set item spacing if provided
  if (itemSpacing !== undefined) {
    if (typeof itemSpacing !== "number") {
      throw new Error("Item spacing must be a number");
    }
    node.itemSpacing = itemSpacing;
  }

  // Set counter axis spacing if provided
  if (counterAxisSpacing !== undefined) {
    if (typeof counterAxisSpacing !== "number") {
      throw new Error("Counter axis spacing must be a number");
    }
    // counterAxisSpacing only applies when layoutWrap is WRAP
    if (node.layoutWrap !== "WRAP") {
      throw new Error("Counter axis spacing can only be set on frames with layoutWrap set to WRAP");
    }
    node.counterAxisSpacing = counterAxisSpacing;
  }

  return {
    id: node.id,
    name: node.name,
    itemSpacing: node.itemSpacing || undefined,
    counterAxisSpacing: node.counterAxisSpacing || undefined,
    layoutMode: node.layoutMode,
    layoutWrap: node.layoutWrap,
  };
}

async function setDefaultConnector(params: SetDefaultConnectorParams) {
  const { connectorId } = params || {};

  // If connectorId is provided, search and set by that ID (do not check existing storage)
  if (connectorId) {
    // Get node by specified ID
    const node = await figma.getNodeByIdAsync(connectorId);
    if (!node) {
      throw new Error(`Connector node not found with ID: ${connectorId}`);
    }

    // Check node type
    if (node.type !== "CONNECTOR") {
      throw new Error(`Node is not a connector: ${connectorId}`);
    }

    // Set the found connector as the default connector
    await figma.clientStorage.setAsync("defaultConnectorId", connectorId);

    return {
      success: true,
      message: `Default connector set to: ${connectorId}`,
      connectorId: connectorId,
    };
  }
  // If connectorId is not provided, check existing storage
  else {
    // Check if there is an existing default connector in client storage
    try {
      const existingConnectorId = await figma.clientStorage.getAsync("defaultConnectorId");

      // If there is an existing connector ID, check if the node is still valid
      if (existingConnectorId) {
        try {
          const existingConnector = await figma.getNodeByIdAsync(existingConnectorId);

          // If the stored connector still exists and is of type CONNECTOR
          if (existingConnector && existingConnector.type === "CONNECTOR") {
            return {
              success: true,
              message: `Default connector is already set to: ${existingConnectorId}`,
              connectorId: existingConnectorId,
              exists: true,
            };
          }
          // The stored connector is no longer valid - find a new connector
          else {
            console.log(
              `Stored connector ID ${existingConnectorId} is no longer valid, finding a new connector...`,
            );
          }
        } catch (error) {
          console.log(
            `Error finding stored connector: ${errorMessage(error)}. Will try to set a new one.`,
          );
        }
      }
    } catch (error) {
      console.log(`Error checking for existing connector: ${errorMessage(error)}`);
    }

    // If there is no stored default connector or it is invalid, find one in the current page
    try {
      // Find CONNECTOR type nodes in the current page
      const currentPageConnectors = figma.currentPage.findAllWithCriteria({ types: ["CONNECTOR"] });

      if (currentPageConnectors && currentPageConnectors.length > 0) {
        // Use the first connector found
        const foundConnector = currentPageConnectors[0];
        const autoFoundId = foundConnector.id;

        // Set the found connector as the default connector
        await figma.clientStorage.setAsync("defaultConnectorId", autoFoundId);

        return {
          success: true,
          message: `Automatically found and set default connector to: ${autoFoundId}`,
          connectorId: autoFoundId,
          autoSelected: true,
        };
      } else {
        // If no connector is found in the current page, show a guide message
        throw new Error(
          "No connector found in the current page. Please create a connector in Figma first or specify a connector ID.",
        );
      }
    } catch (error) {
      // Error occurred while running findAllWithCriteria
      throw new Error(`Failed to find a connector: ${errorMessage(error)}`);
    }
  }
}

async function createCursorNode(targetNodeId: string) {
  const svgString = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8V35.2419L22 28.4315L27 39.7823C27 39.7823 28.3526 40.2722 29 39.7823C29.6474 39.2924 30.2913 38.3057 30 37.5121C28.6247 33.7654 25 26.1613 25 26.1613H32L16 8Z" fill="#202125" />
  </svg>`;
  try {
    const targetNode = await figma.getNodeByIdAsync(targetNodeId);
    if (!targetNode) throw new Error("Target node not found");

    // The targetNodeId has semicolons since it is a nested node.
    // So we need to get the parent node ID from the target node ID and check if we can appendChild to it or not.
    let parentNodeId = targetNodeId.includes(";") ? targetNodeId.split(";")[0] : targetNodeId;
    if (!parentNodeId) throw new Error("Could not determine parent node ID");

    // Find the parent node to append cursor node as child
    let parentNode = await figma.getNodeByIdAsync(parentNodeId);
    if (!parentNode) throw new Error("Parent node not found");

    // If the parent node is not eligible to appendChild, set the parentNode to the parent of the parentNode
    if (
      parentNode.type === "INSTANCE" ||
      parentNode.type === "COMPONENT" ||
      parentNode.type === "COMPONENT_SET"
    ) {
      parentNode = parentNode.parent;
      if (!parentNode) throw new Error("Parent node not found");
    }

    // Create the cursor node
    const importedNode = await figma.createNodeFromSvg(svgString);
    if (!importedNode || !importedNode.id) {
      throw new Error("Failed to create imported cursor node");
    }
    importedNode.name = "Phoenix Figma MCP / Mouse Cursor";
    importedNode.resize(48, 48);

    const cursorNode = importedNode.findOne((node: SceneNode) => node.type === "VECTOR");
    if (cursorNode?.type === "VECTOR") {
      cursorNode.fills = [
        {
          type: "SOLID",
          color: { r: 0, g: 0, b: 0 },
          opacity: 1,
        },
      ];
      cursorNode.strokes = [
        {
          type: "SOLID",
          color: { r: 1, g: 1, b: 1 },
          opacity: 1,
        },
      ];
      cursorNode.strokeWeight = 2;
      cursorNode.strokeAlign = "OUTSIDE";
      cursorNode.effects = [
        {
          type: "DROP_SHADOW",
          color: { r: 0, g: 0, b: 0, a: 0.3 },
          offset: { x: 1, y: 1 },
          radius: 2,
          spread: 0,
          visible: true,
          blendMode: "NORMAL",
        },
      ];
    }

    // Append the cursor node to the parent node
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node ${parentNode.id} does not support children`);
    }
    (parentNode as ChildrenMixin).appendChild(importedNode);

    // if the parentNode has auto-layout enabled, set the layoutPositioning to ABSOLUTE
    if ("layoutMode" in parentNode && parentNode.layoutMode !== "NONE") {
      importedNode.layoutPositioning = "ABSOLUTE";
    }

    // Adjust the importedNode's position to the targetNode's position
    const targetBounds =
      "absoluteBoundingBox" in targetNode ? targetNode.absoluteBoundingBox : null;
    const parentBounds =
      "absoluteBoundingBox" in parentNode ? parentNode.absoluteBoundingBox : null;

    if (targetBounds && parentBounds) {
      console.log("targetNode.absoluteBoundingBox", targetBounds);
      console.log("parentNode.absoluteBoundingBox", parentBounds);
      importedNode.x = targetBounds.x - parentBounds.x + targetBounds.width / 2 - 48 / 2;
      importedNode.y = targetBounds.y - parentBounds.y + targetBounds.height / 2 - 48 / 2;
    } else if (
      "x" in targetNode &&
      "y" in targetNode &&
      "width" in targetNode &&
      "height" in targetNode
    ) {
      // if the targetNode has x, y, width, height, calculate center based on relative position
      console.log(
        "targetNode.x/y/width/height",
        targetNode.x,
        targetNode.y,
        targetNode.width,
        targetNode.height,
      );
      importedNode.x = targetNode.x + targetNode.width / 2 - 48 / 2;
      importedNode.y = targetNode.y + targetNode.height / 2 - 48 / 2;
    } else {
      // Fallback: Place at top-left of target if possible, otherwise at (0,0) relative to parent
      if (
        "x" in targetNode &&
        "y" in targetNode &&
        typeof targetNode.x === "number" &&
        typeof targetNode.y === "number"
      ) {
        console.log("Fallback to targetNode x/y");
        importedNode.x = targetNode.x;
        importedNode.y = targetNode.y;
      } else {
        console.log("Fallback to (0,0)");
        importedNode.x = 0;
        importedNode.y = 0;
      }
    }

    // get the importedNode ID and the importedNode
    console.log("importedNode", importedNode);

    return { id: importedNode.id, node: importedNode };
  } catch (error) {
    console.error("Error creating cursor from SVG:", error);
    return { id: null, node: null, error: errorMessage(error) };
  }
}

async function createConnections(params: CreateConnectionsParams) {
  if (!params || !params.connections || !Array.isArray(params.connections)) {
    throw new Error("Missing or invalid connections parameter");
  }

  const { connections } = params;

  // Command ID for progress tracking
  const commandId = params.commandId || generateCommandId();
  sendProgressUpdate(
    commandId,
    "create_connections",
    "started",
    0,
    connections.length,
    0,
    `Starting to create ${connections.length} connections`,
  );

  // Get default connector ID from client storage
  const defaultConnectorId = await figma.clientStorage.getAsync("defaultConnectorId");
  if (!defaultConnectorId) {
    throw new Error(
      'No default connector set. Please try one of the following options to create connections:\n1. Create a connector in FigJam and copy/paste it to your current page, then run the "set_default_connector" command.\n2. Select an existing connector on the current page, then run the "set_default_connector" command.',
    );
  }

  // Get the default connector
  const defaultConnector = await figma.getNodeByIdAsync(defaultConnectorId);
  if (!defaultConnector) {
    throw new Error(`Default connector not found with ID: ${defaultConnectorId}`);
  }
  if (defaultConnector.type !== "CONNECTOR") {
    throw new Error(`Node is not a connector: ${defaultConnectorId}`);
  }

  // Results array for connection creation
  const results: Array<Record<string, unknown>> = [];
  let processedCount = 0;
  const totalCount = connections.length;

  // Preload fonts (used for text if provided)
  let fontLoaded = false;

  for (let i = 0; i < connections.length; i++) {
    try {
      const { startNodeId: originalStartId, endNodeId: originalEndId, text } = connections[i];
      let startId = originalStartId;
      let endId = originalEndId;

      // Check and potentially replace start node ID
      if (startId.includes(";")) {
        console.log(`Nested start node detected: ${startId}. Creating cursor node.`);
        const cursorResult = await createCursorNode(startId);
        if (!cursorResult || !cursorResult.id) {
          throw new Error(`Failed to create cursor node for nested start node: ${startId}`);
        }
        startId = cursorResult.id;
      }

      const startNode = await figma.getNodeByIdAsync(startId);
      if (!startNode) throw new Error(`Start node not found with ID: ${startId}`);

      // Check and potentially replace end node ID
      if (endId.includes(";")) {
        console.log(`Nested end node detected: ${endId}. Creating cursor node.`);
        const cursorResult = await createCursorNode(endId);
        if (!cursorResult || !cursorResult.id) {
          throw new Error(`Failed to create cursor node for nested end node: ${endId}`);
        }
        endId = cursorResult.id;
      }
      const endNode = await figma.getNodeByIdAsync(endId);
      if (!endNode) throw new Error(`End node not found with ID: ${endId}`);

      // Clone the default connector
      const clonedConnector = defaultConnector.clone();

      // Update connector name using potentially replaced node names
      clonedConnector.name = `Phoenix Figma MCP / Connector / ${startNode.id} / ${endNode.id}`;

      // Set start and end points using potentially replaced IDs
      clonedConnector.connectorStart = {
        endpointNodeId: startId,
        magnet: "AUTO",
      };

      clonedConnector.connectorEnd = {
        endpointNodeId: endId,
        magnet: "AUTO",
      };

      // Add text (if provided)
      if (text) {
        try {
          // Try to load the necessary fonts
          try {
            // First check if default connector has font and use the same
            if (
              defaultConnector.text &&
              defaultConnector.text.fontName &&
              defaultConnector.text.fontName !== figma.mixed
            ) {
              const fontName = defaultConnector.text.fontName;
              await figma.loadFontAsync(fontName);
              clonedConnector.text.fontName = fontName;
            } else {
              // Try default Inter font
              await figma.loadFontAsync({ family: "Inter", style: "Regular" });
            }
          } catch (fontError) {
            // If first font load fails, try another font style
            try {
              await figma.loadFontAsync({ family: "Inter", style: "Medium" });
            } catch (mediumFontError) {
              // If second font fails, try system font
              try {
                await figma.loadFontAsync({ family: "System", style: "Regular" });
              } catch (systemFontError) {
                // If all font loading attempts fail, throw error
                throw new Error(`Failed to load any font: ${errorMessage(fontError)}`);
              }
            }
          }

          // Set the text
          clonedConnector.text.characters = text;
        } catch (textError) {
          console.error("Error setting text:", textError);
          // Continue with connection even if text setting fails
          results.push({
            id: clonedConnector.id,
            startNodeId: originalStartId,
            endNodeId: originalEndId,
            text: "",
            textError: errorMessage(textError),
          });

          // Continue to next connection
          continue;
        }
      }

      // Add to results (using the *original* IDs for reference if needed)
      results.push({
        id: clonedConnector.id,
        originalStartNodeId: originalStartId,
        originalEndNodeId: originalEndId,
        usedStartNodeId: startId, // ID actually used for connection
        usedEndNodeId: endId, // ID actually used for connection
        text: text || "",
      });

      // Update progress
      processedCount++;
      sendProgressUpdate(
        commandId,
        "create_connections",
        "in_progress",
        Math.round((processedCount / totalCount) * 100),
        totalCount,
        processedCount,
        `Created connection ${processedCount}/${totalCount}`,
      );
    } catch (error) {
      console.error("Error creating connection", error);
      // Continue processing remaining connections even if an error occurs
      processedCount++;
      sendProgressUpdate(
        commandId,
        "create_connections",
        "in_progress",
        Math.round((processedCount / totalCount) * 100),
        totalCount,
        processedCount,
        `Error creating connection: ${errorMessage(error)}`,
      );

      results.push({
        error: errorMessage(error),
        connectionInfo: connections[i],
      });
    }
  }

  // Completion update
  sendProgressUpdate(
    commandId,
    "create_connections",
    "completed",
    100,
    totalCount,
    totalCount,
    `Completed creating ${results.length} connections`,
  );

  return {
    success: true,
    count: results.length,
    connections: results,
  };
}

// Set focus on a specific node
async function setFocus(params: SetFocusParams) {
  if (!params || !params.nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(params.nodeId);
  if (!node) {
    throw new Error(`Node with ID ${params.nodeId} not found`);
  }
  if (node.type === "DOCUMENT" || node.type === "PAGE") {
    throw new Error(`Node type ${node.type} cannot be selected`);
  }

  // The remaining variants are SceneNode variants.
  figma.currentPage.selection = [node];

  // Scroll and zoom to show the node in viewport
  figma.viewport.scrollAndZoomIntoView([node]);

  return {
    success: true,
    name: node.name,
    id: node.id,
    message: `Focused on node "${node.name}"`,
  };
}

// Set selection to multiple nodes
async function setSelections(params: SetSelectionsParams) {
  if (!params || !params.nodeIds || !Array.isArray(params.nodeIds)) {
    throw new Error("Missing or invalid nodeIds parameter");
  }

  if (params.nodeIds.length === 0) {
    throw new Error("nodeIds array cannot be empty");
  }

  // Get all valid nodes
  const nodes: SceneNode[] = [];
  const notFoundIds: string[] = [];

  for (const nodeId of params.nodeIds) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (isSceneNode(node)) {
      nodes.push(node);
    } else {
      notFoundIds.push(nodeId);
    }
  }

  if (nodes.length === 0) {
    throw new Error(`No valid nodes found for the provided IDs: ${params.nodeIds.join(", ")}`);
  }

  // Set selection to the nodes
  figma.currentPage.selection = nodes;

  // Scroll and zoom to show all nodes in viewport
  figma.viewport.scrollAndZoomIntoView(nodes);

  const selectedNodes = nodes.map((node) => ({
    name: node.name,
    id: node.id,
  }));

  return {
    success: true,
    count: nodes.length,
    selectedNodes: selectedNodes,
    notFoundIds: notFoundIds,
    message: `Selected ${nodes.length} nodes${notFoundIds.length > 0 ? ` (${notFoundIds.length} not found)` : ""}`,
  };
}

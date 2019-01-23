//@flow
import * as React from 'react';
import _ from 'lodash';
import { reactToString } from 'rsuite-utils/lib/utils';

const SEARCH_BAR_HEIGHT = 48;
const MENU_PADDING = 12;

/**
 * 判断当前节点是否应该显示
 * @param {*} expandItemValues
 * @param {*} parentKeys
 */
export function shouldShowNodeByExpanded(expandItemValues: any[] = [], parentKeys: any[] = []) {
  const intersectionKeys = _.intersection(expandItemValues, parentKeys);
  if (intersectionKeys.length === parentKeys.length) {
    return true;
  }
  return false;
}

/**
 * 拍平树结构为数组
 * @param {*} tree
 * @param {*} executor
 * @param {*} props
 */
export function flattenTree(
  tree: any[],
  executor: (node: Object, index: number) => Object,
  props: Object
) {
  const { childrenKey } = props;

  const flattenData = [];
  const traverse = (data: any[]) => {
    data.forEach((d: Object, index: number) => {
      const node = executor(d, index);
      flattenData.push({ ...node });
      if (d[childrenKey]) {
        traverse(d[childrenKey]);
      }
    });
  };

  traverse(tree);
  return flattenData;
}

/**
 * 获取当前节点所有的祖先节点
 * @param {*} node
 */
export function getNodeParentKeys(node: Object, props: Object) {
  const { valueKey } = props;
  const parentKeys = [];
  const traverse = (node: Object) => {
    if (node && node.parentNode) {
      traverse(node.parentNode);
      parentKeys.push(node.parentNode[valueKey]);
    }
  };

  traverse(node);
  return parentKeys;
}

export function isEveryChildChecked(node: Object, nodes: Object, props: Object) {
  const { childrenKey } = props;
  let children = null;
  if (node[childrenKey]) {
    children = node[childrenKey].filter(
      child => nodes[child.refKey] && !nodes[child.refKey].uncheckable
    );
    if (!children.length) {
      return nodes[node.refKey].check;
    }
    return children.every((child: Object) => {
      if (child[childrenKey] && child[childrenKey].length) {
        return isEveryChildChecked(child, nodes, props);
      }
      return nodes[child.refKey].check;
    });
  }
  return nodes[node.refKey].check;
}

export function isSomeChildChecked(node: Object, nodes: Object, props: Object) {
  const { childrenKey } = props;
  if (!node[childrenKey]) {
    return false;
  }

  return node[childrenKey].some((child: Object) => {
    if (nodes[child.refKey] && nodes[child.refKey].check) {
      return true;
    }
    return isSomeChildChecked(child, nodes, props);
  });
}

/**
 * 判断第一层节点是否存在有children的节点
 * @param {*} data
 */
export function isSomeNodeHasChildren(data: any[], childrenKey: string) {
  return data.some((node: Object) => node[childrenKey]);
}

/**
 * 获取每个节点的最顶层父节点的check值
 * @param {*} nodes
 * @param {*} node
 */
export function getTopParentNodeCheckState(nodes: Object, node: Object) {
  if (node.parentNode) {
    return getTopParentNodeCheckState(nodes, node.parentNode);
  }
  return nodes[node.refKey].check;
}

/**
 * 判断当前节点是否显示
 * @param {*} label
 * @param {*} searchKeyword
 */
export function shouldDisplay(label: any, searchKeyword: string) {
  if (!_.trim(searchKeyword)) {
    return true;
  }
  const keyword = searchKeyword.toLocaleLowerCase();
  if (typeof label === 'string') {
    return label.toLocaleLowerCase().indexOf(keyword) >= 0;
  } else if (React.isValidElement(label)) {
    const nodes = reactToString(label);
    return (
      nodes
        .join('')
        .toLocaleLowerCase()
        .indexOf(keyword) >= 0
    );
  }
  return false;
}

/**
 * 获取 VirtualList 的高度
 * @param {*} inline
 * @param {*} height
 */
export function getVirtualLisHeight(inline: boolean, height?: number = 0) {
  return inline ? height - MENU_PADDING * 2 : height - SEARCH_BAR_HEIGHT - MENU_PADDING * 2;
}

/**
 * 获取该节点的兄弟节点是否都为 uncheckable
 * @param {*} node
 */
export function getSiblingNodeUncheckable(node: Object, nodes: Object) {
  const list = [];
  if (!node.parentNode) {
    return false;
  }

  const parentNodeRefkey = node.parentNode ? node.parentNode.refKey : '';

  Object.keys(nodes).forEach((refKey: string) => {
    const curNode = nodes[refKey];
    if (curNode.parentNode && curNode.parentNode.refKey === parentNodeRefkey) {
      list.push(curNode);
    }
  });

  return list.every(node => node.uncheckable);
}

/**
 * 获取当前节点的所有子节点是否都为 uncheckable
 */
export function getEveryChildUncheckable(node: Object, nodes: Object) {
  const list = [];
  Object.keys(nodes).forEach((refKey: string) => {
    const curNode = nodes[refKey];
    if (curNode.parentNode && curNode.parentNode.refKey === node.refKey) {
      list.push(curNode);
    }
  });

  return list.every(node => node.uncheckable);
}

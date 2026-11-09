/**
 * Roadmap source data.
 * Each problem is "Title|leetcode-slug|E/M/H" (append "|P" for LeetCode Premium).
 * Problem numbers (1–180) are assigned in order by `src/data/index.ts`.
 */
import type { Phase, TopicDefinition } from "@/types/roadmap";

export const PHASES: Phase[] = [
  {
    id: 1,
    name: "Phase 1 – Core DSA foundations",
    blurb: "Essential topics. Don't skip them, even if you've solved some of these before.",
  },
  {
    id: 2,
    name: "Phase 2 – Intermediate to advanced",
    blurb: "The make-or-break phase for mid-level interviews: recursion, trees, graphs and DP.",
  },
  {
    id: 3,
    name: "Phase 3 – Extra mid-level challenges",
    blurb: "Pick these up once the core patterns feel comfortable.",
  },
];

export const TOPIC_DEFINITIONS: TopicDefinition[] = [
  {
    slug: "arrays-hashing",
    phase: 1,
    name: "Arrays & Hashing",
    priority: "Very high",
    concepts: ["HashMap", "HashSet", "Frequency counting", "Prefix sums", "Array indexing tricks"],
    overview:
      "Most interview problems start here. A hash map turns \"have I seen this before?\" from an O(n) scan into an O(1) lookup, which is how you get most O(n²) brute-force solutions down to O(n).",
    recognize: [
      "You need to find pairs, duplicates or complements (e.g. target − x).",
      "You need to count how often things appear, or group items by a key.",
      "Values are in the range 1..n, so the array itself can act as a hash table.",
    ],
    template: `// Frequency count
Map<Integer, Integer> freq = new HashMap<>();
for (int x : nums) freq.merge(x, 1, Integer::sum);

// Complement lookup (Two Sum)
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    Integer j = seen.get(target - nums[i]);
    if (j != null) return new int[]{j, i};
    seen.put(nums[i], i);
}`,
    pitfalls: [
      "Check the map before you insert the current element, or you'll pair an element with itself.",
      "To group by a key, use a canonical form (e.g. sorted chars or a 26-count signature).",
    ],
    problems: [
      "Two Sum|two-sum|E",
      "Contains Duplicate|contains-duplicate|E",
      "Valid Anagram|valid-anagram|E",
      "Group Anagrams|group-anagrams|M",
      "Top K Frequent Elements|top-k-frequent-elements|M",
      "Product of Array Except Self|product-of-array-except-self|M",
      "Longest Consecutive Sequence|longest-consecutive-sequence|M",
      "Majority Element|majority-element|E",
      "Subarray Sum Equals K|subarray-sum-equals-k|M",
      "First Missing Positive|first-missing-positive|H",
      "Insert Delete GetRandom O(1)|insert-delete-getrandom-o1|M",
      "Longest Harmonious Subsequence|longest-harmonious-subsequence|E",
    ],
  },
  {
    slug: "two-pointers",
    phase: 1,
    name: "Two Pointers",
    priority: "Very high",
    concepts: ["Opposite-direction pointers", "Fast/slow pointers", "Sorted-array manipulation", "Dutch National Flag"],
    overview:
      "Two indices move through the data according to a rule, so you avoid nested loops. On sorted input, comparing the two ends tells you which pointer to move.",
    recognize: [
      "The input is sorted, or sorting it won't break the problem.",
      "You're looking for a pair or triplet that meets a sum condition.",
      "You must modify an array in place (remove, partition or compact).",
    ],
    template: `int l = 0, r = n - 1;
while (l < r) {
    int sum = a[l] + a[r];
    if (sum == target) return new int[]{l, r};
    if (sum < target) l++;   // need a bigger sum
    else r--;                // need a smaller sum
}

// In-place compaction (read/write pointers)
int w = 0;
for (int x : nums) if (keep(x)) nums[w++] = x;`,
    pitfalls: [
      "For 3Sum/4Sum, skip duplicate values at every pointer level, not just the outer one.",
      "Watch for int overflow in 4Sum: compute sums with long.",
    ],
    problems: [
      "Valid Palindrome|valid-palindrome|E",
      "Two Sum II – Input Array Is Sorted|two-sum-ii-input-array-is-sorted|M",
      "3Sum|3sum|M",
      "4Sum|4sum|M",
      "Container With Most Water|container-with-most-water|M",
      "Trapping Rain Water|trapping-rain-water|H",
      "Remove Duplicates from Sorted Array|remove-duplicates-from-sorted-array|E",
      "Sort Colors|sort-colors|M",
      "Move Zeroes|move-zeroes|E",
    ],
  },
  {
    slug: "sliding-window",
    phase: 1,
    name: "Sliding Window",
    priority: "Very high",
    concepts: ["Fixed window", "Variable window", "Frequency window", "Monotonic deque"],
    overview:
      "A window [l, r] moves across a string or array. Expand r to take in elements, and shrink l when the window breaks a constraint. Each element enters and leaves once, so the whole pass is O(n).",
    recognize: [
      "The problem asks for the longest, shortest or count of a contiguous subarray or substring.",
      "There's a constraint like \"at most k distinct\", \"no repeats\" or \"sum ≤ k\".",
      "The window size is fixed (k) and you need a value for every window.",
    ],
    template: `Map<Character, Integer> win = new HashMap<>();
int l = 0, best = 0;
for (int r = 0; r < s.length(); r++) {
    win.merge(s.charAt(r), 1, Integer::sum);     // expand
    while (/* window is invalid */) {
        win.merge(s.charAt(l), -1, Integer::sum); // shrink
        l++;
    }
    best = Math.max(best, r - l + 1);             // record
}`,
    pitfalls: [
      "Sliding windows need monotonic validity. With negative numbers, use prefix sums instead.",
      "For \"minimum window\" problems, record the answer inside the shrink loop.",
    ],
    problems: [
      "Maximum Average Subarray I|maximum-average-subarray-i|E",
      "Longest Substring Without Repeating Characters|longest-substring-without-repeating-characters|M",
      "Longest Repeating Character Replacement|longest-repeating-character-replacement|M",
      "Permutation in String|permutation-in-string|M",
      "Find All Anagrams in a String|find-all-anagrams-in-a-string|M",
      "Minimum Window Substring|minimum-window-substring|H",
      "Sliding Window Maximum|sliding-window-maximum|H",
      "Max Consecutive Ones III|max-consecutive-ones-iii|M",
      "Fruit Into Baskets|fruit-into-baskets|M",
      "Subarray Product Less Than K|subarray-product-less-than-k|M",
    ],
  },
  {
    slug: "prefix-sum",
    phase: 1,
    name: "Prefix Sum & Difference Arrays",
    priority: "High",
    concepts: ["Prefix sums", "Prefix frequency maps", "Difference arrays", "Range queries"],
    overview:
      "prefix[i] is the sum of the first i elements, so the sum of any range [l, r] is prefix[r+1] − prefix[l] in O(1). Store prefix sums in a hash map to count subarrays with a target sum. A difference array does the reverse: it applies many range updates in O(1) each.",
    recognize: [
      "You need many range-sum queries on an array that doesn't change.",
      "The problem says \"count subarrays with sum k\", and the values can be negative.",
      "You need to apply lots of \"add v to the range [l, r]\" updates, then read the result once.",
    ],
    template: `// Count subarrays with sum == k
Map<Integer, Integer> count = new HashMap<>();
count.put(0, 1);               // empty prefix
int sum = 0, ans = 0;
for (int x : nums) {
    sum += x;
    ans += count.getOrDefault(sum - k, 0);
    count.merge(sum, 1, Integer::sum);
}

// Difference array: add v to [l, r]
diff[l] += v;  diff[r + 1] -= v;
// then running-sum diff[] to get the final array`,
    pitfalls: [
      "Don't forget the base entry: count.put(0, 1) for counting, or first.put(0, -1) when you need lengths.",
      "For \"divisible by k\" problems, normalise negative remainders: ((sum % k) + k) % k.",
    ],
    problems: [
      "Range Sum Query – Immutable|range-sum-query-immutable|E",
      "Find Pivot Index|find-pivot-index|E",
      "Continuous Subarray Sum|continuous-subarray-sum|M",
      "Contiguous Array|contiguous-array|M",
      "Corporate Flight Bookings|corporate-flight-bookings|M",
      "Maximum Size Subarray Sum Equals K|maximum-size-subarray-sum-equals-k|M|P",
    ],
  },
  {
    slug: "binary-search",
    phase: 1,
    name: "Binary Search",
    priority: "Very high",
    concepts: ["Lower/upper bounds", "Rotated arrays", "Binary search on the answer", "Monotonic predicates"],
    overview:
      "Binary search works on any monotonic yes/no predicate, not only on sorted arrays. If the predicate is false…false, true…true, you can find the first true in O(log n). That covers \"minimum speed\", \"minimum capacity\" and similar problems.",
    recognize: [
      "The input is sorted, or sorted and rotated.",
      "The problem asks for the minimum or maximum value that makes something feasible.",
      "If X works, every larger (or smaller) X also works. That's a monotonic predicate.",
    ],
    template: `// Find the smallest value in [lo, hi] where feasible() is true
int lo = minAnswer, hi = maxAnswer;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (feasible(mid)) hi = mid;   // mid works, try smaller
    else lo = mid + 1;             // mid fails, go bigger
}
return lo;`,
    pitfalls: [
      "Pick one loop style (lo < hi or lo <= hi) and stick with it, or you'll hit off-by-one bugs.",
      "Use lo + (hi - lo) / 2 to avoid overflow, and use long inside feasible() when you add things up.",
    ],
    problems: [
      "Binary Search|binary-search|E",
      "Search Insert Position|search-insert-position|E",
      "First Bad Version|first-bad-version|E",
      "Find First and Last Position of Element in Sorted Array|find-first-and-last-position-of-element-in-sorted-array|M",
      "Search in Rotated Sorted Array|search-in-rotated-sorted-array|M",
      "Find Minimum in Rotated Sorted Array|find-minimum-in-rotated-sorted-array|M",
      "Find Peak Element|find-peak-element|M",
      "Koko Eating Bananas|koko-eating-bananas|M",
      "Capacity To Ship Packages Within D Days|capacity-to-ship-packages-within-d-days|M",
      "Median of Two Sorted Arrays|median-of-two-sorted-arrays|H",
      "Split Array Largest Sum|split-array-largest-sum|H",
    ],
  },
  {
    slug: "sorting-intervals",
    phase: 1,
    name: "Sorting & Intervals",
    priority: "High",
    concepts: ["Custom comparators", "Merge sort", "Quicksort", "Interval merging", "Sorting by endpoints"],
    overview:
      "Sorting often turns a hard problem into a linear scan. For intervals, sort by start to merge them, or by end for greedy scheduling (keep as many non-overlapping intervals as possible).",
    recognize: [
      "The input is a list of [start, end] pairs.",
      "You need to merge, insert, count overlaps or remove the fewest intervals.",
      "The answer depends on a custom ordering, like \"Largest Number\".",
    ],
    template: `Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> res = new ArrayList<>();
for (int[] cur : iv) {
    if (res.isEmpty() || res.get(res.size() - 1)[1] < cur[0]) {
        res.add(cur);                         // no overlap
    } else {
        int[] last = res.get(res.size() - 1); // overlap: extend
        last[1] = Math.max(last[1], cur[1]);
    }
}`,
    pitfalls: [
      "Use Integer.compare in comparators. a - b can overflow.",
      "Check whether touching intervals ([1,2] and [2,3]) count as overlapping in that problem.",
    ],
    problems: [
      "Merge Intervals|merge-intervals|M",
      "Insert Interval|insert-interval|M",
      "Non-overlapping Intervals|non-overlapping-intervals|M",
      "Meeting Rooms II|meeting-rooms-ii|M|P",
      "Minimum Number of Arrows to Burst Balloons|minimum-number-of-arrows-to-burst-balloons|M",
      "Largest Number|largest-number|M",
      "Sort an Array|sort-an-array|M",
    ],
  },
  {
    slug: "linked-lists",
    phase: 1,
    name: "Linked Lists",
    priority: "High",
    concepts: ["Dummy nodes", "Slow/fast pointers", "Reversal", "Pointer manipulation", "Cycle detection"],
    overview:
      "Linked list problems are mostly careful pointer bookkeeping. Three tools cover nearly all of them: a dummy head node so edge cases go away, slow/fast pointers for the middle or a cycle, and in-place reversal.",
    recognize: [
      "You need the middle, the nth node from the end, or to detect a cycle. Use slow/fast pointers.",
      "The head itself might change. Use a dummy node.",
      "The problem asks you to reverse, reorder or merge lists.",
    ],
    template: `// Reverse a list
ListNode prev = null, cur = head;
while (cur != null) {
    ListNode next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
}
return prev;

// Middle node
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
}`,
    pitfalls: [
      "Save next before you rewire cur.next.",
      "Draw the pointers on paper for k-group reversal. It's easy to lose a link.",
    ],
    problems: [
      "Reverse Linked List|reverse-linked-list|E",
      "Linked List Cycle|linked-list-cycle|E",
      "Linked List Cycle II|linked-list-cycle-ii|M",
      "Middle of the Linked List|middle-of-the-linked-list|E",
      "Merge Two Sorted Lists|merge-two-sorted-lists|E",
      "Remove Nth Node From End of List|remove-nth-node-from-end-of-list|M",
      "Add Two Numbers|add-two-numbers|M",
      "Reorder List|reorder-list|M",
      "Reverse Nodes in k-Group|reverse-nodes-in-k-group|H",
    ],
  },
  {
    slug: "stack",
    phase: 1,
    name: "Stack & Monotonic Stack",
    priority: "High",
    concepts: ["Monotonic increasing/decreasing stacks", "Expression evaluation", "Stack simulation"],
    overview:
      "A stack handles anything nested or last-in-first-out, like brackets or expressions. A monotonic stack keeps its elements in sorted order. When a new element breaks that order, you pop, and each pop answers a \"next greater\" or \"previous smaller\" question in O(n) total.",
    recognize: [
      "The problem asks for the next or previous greater/smaller element.",
      "You're matching brackets, evaluating expressions or simulating collisions.",
      "You need the largest rectangle or span for each element.",
    ],
    template: `// Days until a warmer temperature (next greater element)
int[] ans = new int[n];
Deque<Integer> st = new ArrayDeque<>();   // indices; temps decreasing
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && t[st.peek()] < t[i]) {
        int j = st.pop();
        ans[j] = i - j;                    // i is j's next greater
    }
    st.push(i);
}`,
    pitfalls: [
      "Push indices, not values, when you need distances or widths.",
      "Use ArrayDeque, not the legacy Stack class.",
    ],
    problems: [
      "Valid Parentheses|valid-parentheses|E",
      "Min Stack|min-stack|M",
      "Evaluate Reverse Polish Notation|evaluate-reverse-polish-notation|M",
      "Daily Temperatures|daily-temperatures|M",
      "Next Greater Element I|next-greater-element-i|E",
      "Largest Rectangle in Histogram|largest-rectangle-in-histogram|H",
      "Online Stock Span|online-stock-span|M",
      "Remove K Digits|remove-k-digits|M",
      "Asteroid Collision|asteroid-collision|M",
    ],
  },
  {
    slug: "queue-heap",
    phase: 1,
    name: "Queue, Deque & Heap",
    priority: "High",
    concepts: ["PriorityQueue", "Min/max heaps", "Two heaps", "Top-K", "Deque"],
    overview:
      "A heap gives you the min or max element in O(log n) per operation. For top-K, keep a heap of size K. For a running median, use two heaps (a max-heap for the lower half, a min-heap for the upper half). For K-way merges, push the head of each list.",
    recognize: [
      "The problem asks for the K largest, smallest, closest or most frequent items.",
      "You need the median or extremes of a stream of data.",
      "You're merging K sorted things, or always processing the most urgent item next.",
    ],
    template: `// Kth largest: min-heap of size k
PriorityQueue<Integer> pq = new PriorityQueue<>();
for (int x : nums) {
    pq.offer(x);
    if (pq.size() > k) pq.poll();   // drop the smallest
}
return pq.peek();

// Max-heap
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());`,
    pitfalls: [
      "For top-K largest, use a min-heap of size K. That's the counter-intuitive part.",
      "Don't build heap comparators with subtraction. Use Integer.compare.",
    ],
    problems: [
      "Implement Queue using Stacks|implement-queue-using-stacks|E",
      "Kth Largest Element in an Array|kth-largest-element-in-an-array|M",
      "Find Median from Data Stream|find-median-from-data-stream|H",
      "Merge k Sorted Lists|merge-k-sorted-lists|H",
      "Task Scheduler|task-scheduler|M",
      "K Closest Points to Origin|k-closest-points-to-origin|M",
      "Reorganize String|reorganize-string|M",
      "Find K Pairs with Smallest Sums|find-k-pairs-with-smallest-sums|M",
    ],
  },
  {
    slug: "backtracking",
    phase: 2,
    name: "Recursion & Backtracking",
    priority: "High",
    concepts: ["Recursion trees", "Choose / explore / unchoose", "Pruning", "Duplicate handling"],
    overview:
      "Backtracking is a DFS over a tree of decisions. At each level you choose an option, recurse, then undo the choice. Draw the recursion tree first. Once you can see it, the code mostly writes itself.",
    recognize: [
      "The problem asks for all subsets, permutations, combinations or partitions.",
      "You're placing items under constraints (N-Queens, Sudoku, word search).",
      "The input is small (n ≤ ~15–20), which hints that exponential time is expected.",
    ],
    template: `void backtrack(int start, List<Integer> path) {
    res.add(new ArrayList<>(path));            // record (subsets)
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue; // skip dups (sorted input)
        path.add(nums[i]);                     // choose
        backtrack(i + 1, path);                // explore
        path.remove(path.size() - 1);          // unchoose
    }
}`,
    pitfalls: [
      "Add a copy of path to the result (new ArrayList<>(path)), not the list itself.",
      "Sort the input first when you need to skip duplicates.",
    ],
    problems: [
      "Subsets|subsets|M",
      "Subsets II|subsets-ii|M",
      "Permutations|permutations|M",
      "Combination Sum|combination-sum|M",
      "Combination Sum II|combination-sum-ii|M",
      "Letter Combinations of a Phone Number|letter-combinations-of-a-phone-number|M",
      "Palindrome Partitioning|palindrome-partitioning|M",
      "N-Queens|n-queens|H",
      "Word Search|word-search|M",
    ],
  },
  {
    slug: "binary-trees",
    phase: 2,
    name: "Binary Trees",
    priority: "Very high",
    concepts: ["DFS", "BFS", "Preorder / inorder / postorder", "Level-order", "Tree construction"],
    overview:
      "Nearly every tree problem follows one recursive question: \"What does each child need to return so I can answer at this node?\" Postorder DFS (children first) handles height, diameter and path sums. BFS with a queue handles anything level by level.",
    recognize: [
      "The answer depends on the left and right subtrees. Use postorder DFS.",
      "The problem talks about levels, depth order or the \"view\" from one side. Use BFS.",
      "You need to pass information down to children. Pass it as a parameter, preorder style.",
    ],
    template: `// Postorder: return height, update the answer at each node
int best = 0;
int depth(TreeNode node) {
    if (node == null) return 0;
    int l = depth(node.left), r = depth(node.right);
    best = Math.max(best, l + r);   // combine at this node
    return 1 + Math.max(l, r);      // what the parent needs
}

// BFS level order
Queue<TreeNode> q = new ArrayDeque<>();
q.offer(root);
while (!q.isEmpty()) {
    int size = q.size();            // one level
    for (int i = 0; i < size; i++) {
        TreeNode n = q.poll();
        if (n.left != null) q.offer(n.left);
        if (n.right != null) q.offer(n.right);
    }
}`,
    pitfalls: [
      "Handle the null root first.",
      "Separate what you return to the parent from the global answer you track. Max Path Sum depends on this.",
    ],
    problems: [
      "Maximum Depth of Binary Tree|maximum-depth-of-binary-tree|E",
      "Invert Binary Tree|invert-binary-tree|E",
      "Same Tree|same-tree|E",
      "Balanced Binary Tree|balanced-binary-tree|E",
      "Diameter of Binary Tree|diameter-of-binary-tree|E",
      "Binary Tree Level Order Traversal|binary-tree-level-order-traversal|M",
      "Binary Tree Right Side View|binary-tree-right-side-view|M",
      "Lowest Common Ancestor of a Binary Tree|lowest-common-ancestor-of-a-binary-tree|M",
      "Path Sum|path-sum|E",
      "Path Sum II|path-sum-ii|M",
      "Construct Binary Tree from Preorder and Inorder Traversal|construct-binary-tree-from-preorder-and-inorder-traversal|M",
      "Serialize and Deserialize Binary Tree|serialize-and-deserialize-binary-tree|H",
      "Binary Tree Maximum Path Sum|binary-tree-maximum-path-sum|H",
      "Vertical Order Traversal of a Binary Tree|vertical-order-traversal-of-a-binary-tree|H",
    ],
  },
  {
    slug: "bst",
    phase: 2,
    name: "Binary Search Trees",
    priority: "High",
    concepts: ["BST properties", "Inorder traversal", "Search", "Insertion", "Deletion"],
    overview:
      "In a BST, everything on the left is smaller than the node and everything on the right is larger. Two consequences matter most: an inorder traversal visits values in sorted order, and you can discard half the tree at each step.",
    recognize: [
      "You need the kth smallest value, or to check sortedness. Use inorder traversal.",
      "You're validating, searching, inserting or deleting in a BST.",
      "You need the LCA in a BST. Compare both values against the current node.",
    ],
    template: `boolean valid(TreeNode n, long lo, long hi) {
    if (n == null) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
}
// call: valid(root, Long.MIN_VALUE, Long.MAX_VALUE)`,
    pitfalls: [
      "Checking only parent vs child doesn't validate a BST. Pass min/max bounds down the tree.",
      "When deleting a node with two children, replace it with its inorder successor.",
    ],
    problems: [
      "Validate Binary Search Tree|validate-binary-search-tree|M",
      "Kth Smallest Element in a BST|kth-smallest-element-in-a-bst|M",
      "Lowest Common Ancestor of a Binary Search Tree|lowest-common-ancestor-of-a-binary-search-tree|M",
      "Insert into a Binary Search Tree|insert-into-a-binary-search-tree|M",
      "Delete Node in a BST|delete-node-in-a-bst|M",
    ],
  },
  {
    slug: "graphs",
    phase: 2,
    name: "Graphs",
    priority: "Very high",
    concepts: [
      "Adjacency list & matrix",
      "BFS & DFS",
      "Cycle detection",
      "Topological sort (Kahn's & DFS)",
      "Union Find / DSU",
      "Dijkstra",
      "MST – Prim's & Kruskal's",
    ],
    overview:
      "Model the problem as nodes and edges first, then pick an algorithm. Use BFS for shortest paths when edges are unweighted, DFS or Union-Find for connectivity, topological sort for dependencies, Dijkstra for weighted shortest paths, and Prim's or Kruskal's for the minimum cost to connect everything.",
    recognize: [
      "A grid of cells (islands, oranges, water flow) is a graph where each cell links to its neighbours.",
      "\"Prerequisites\" or \"order of tasks\" means a directed graph that needs a topological sort.",
      "\"Is it connected?\", \"redundant edge\" or \"number of components\" points to Union-Find.",
      "Weighted edges with a cheapest path or minimum cost point to Dijkstra or MST.",
    ],
    template: `// Union-Find with path compression
int[] parent;
int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;   // already connected -> cycle
    parent[ra] = rb;
    return true;
}

// Kahn's topological sort
Queue<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
while (!q.isEmpty()) {
    int u = q.poll();
    order.add(u);
    for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
}
// order.size() < n  =>  there is a cycle`,
    pitfalls: [
      "In BFS, mark a node visited when you enqueue it, not when you dequeue it.",
      "Multi-source BFS (Rotting Oranges): put every source in the queue before you start.",
    ],
    problems: [
      "Number of Islands|number-of-islands|M",
      "Max Area of Island|max-area-of-island|M",
      "Clone Graph|clone-graph|M",
      "Rotting Oranges|rotting-oranges|M",
      "Course Schedule|course-schedule|M",
      "Course Schedule II|course-schedule-ii|M",
      "Pacific Atlantic Water Flow|pacific-atlantic-water-flow|M",
      "Graph Valid Tree|graph-valid-tree|M|P",
      "Number of Connected Components in an Undirected Graph|number-of-connected-components-in-an-undirected-graph|M|P",
      "Redundant Connection|redundant-connection|M",
      "Network Delay Time|network-delay-time|M",
      "Cheapest Flights Within K Stops|cheapest-flights-within-k-stops|M",
      "Min Cost to Connect All Points|min-cost-to-connect-all-points|M",
    ],
  },
  {
    slug: "dynamic-programming",
    phase: 2,
    name: "Dynamic Programming",
    priority: "Very high",
    note: "Don't rush into DP. Get comfortable with recursion and memoization first.",
    concepts: [
      "1D DP",
      "2D / Grid DP",
      "Knapsack DP",
      "Subsequence DP",
      "String DP",
      "State-machine DP",
      "Interval DP",
    ],
    overview:
      "DP is recursion plus caching. Start with the brute-force recursion, memoize it, then turn it into a bottom-up table if you need to. For every problem, answer four questions: what the state is, what the transition is, what the base cases are, and what order to fill the table in. Aim to recognise these, not to memorise solutions.",
    recognize: [
      "The problem asks for the number of ways, a min/max cost, or whether something is possible.",
      "The choices at each step overlap. The same subproblem comes up again and again.",
      "Two strings or sequences are compared (LCS, edit distance), which usually means a 2D table.",
    ],
    template: `// 1. State:      dp[i] = best loot from the first i houses
// 2. Transition: dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])
// 3. Base:       dp[0] = 0
// 4. Order:      left to right; only 2 previous values needed
int prev2 = 0, prev1 = 0;
for (int x : nums) {
    int cur = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
}
return prev1;`,
    pitfalls: [
      "In 0/1 knapsack with a 1D array, loop capacity backwards. Coin Change II, which allows unlimited use, loops forwards.",
      "Write the recursion and memoize it before you jump to a table.",
    ],
    problems: [
      "Climbing Stairs|climbing-stairs|E",
      "Min Cost Climbing Stairs|min-cost-climbing-stairs|E",
      "House Robber|house-robber|M",
      "House Robber II|house-robber-ii|M",
      "Coin Change|coin-change|M",
      "Coin Change II|coin-change-ii|M",
      "Maximum Subarray|maximum-subarray|M",
      "Longest Increasing Subsequence|longest-increasing-subsequence|M",
      "Longest Common Subsequence|longest-common-subsequence|M",
      "Edit Distance|edit-distance|M",
      "Word Break|word-break|M",
      "Partition Equal Subset Sum|partition-equal-subset-sum|M",
      "Target Sum|target-sum|M",
      "Unique Paths|unique-paths|M",
      "Unique Paths II|unique-paths-ii|M",
      "Minimum Path Sum|minimum-path-sum|M",
      "Best Time to Buy and Sell Stock|best-time-to-buy-and-sell-stock|E",
      "Best Time to Buy and Sell Stock with Cooldown|best-time-to-buy-and-sell-stock-with-cooldown|M",
      "Burst Balloons|burst-balloons|H",
      "Regular Expression Matching|regular-expression-matching|H",
    ],
  },
  {
    slug: "greedy",
    phase: 2,
    name: "Greedy Algorithms",
    priority: "High",
    concepts: ["Greedy choice", "Sorting", "Interval scheduling", "Local vs global optimum"],
    overview:
      "A greedy algorithm makes the locally best choice at each step and never revisits it. It works only when you can argue that the local choice never hurts the global answer, usually with an exchange argument. When greedy breaks, the problem is often DP.",
    recognize: [
      "Sorting by one key and scanning once seems to give the answer.",
      "You track a running \"farthest reach\" or a running balance.",
      "A quick counterexample doesn't break the greedy rule.",
    ],
    template: `// Jump Game: track the farthest index you can reach
int reach = 0;
for (int i = 0; i < nums.length; i++) {
    if (i > reach) return false;     // stuck
    reach = Math.max(reach, i + nums[i]);
}
return true;`,
    pitfalls: [
      "Look for a counterexample before you trust a greedy rule.",
      "Candy needs two passes, left-to-right then right-to-left.",
    ],
    problems: [
      "Jump Game|jump-game|M",
      "Jump Game II|jump-game-ii|M",
      "Gas Station|gas-station|M",
      "Maximum Units on a Truck|maximum-units-on-a-truck|E",
      "Partition Labels|partition-labels|M",
      "Candy|candy|H",
      "Hand of Straights|hand-of-straights|M",
      "Maximum Length of Pair Chain|maximum-length-of-pair-chain|M",
    ],
  },
  {
    slug: "trie-strings",
    phase: 2,
    name: "Trie & String Algorithms",
    priority: "Medium",
    concepts: ["Trie construction", "Prefix matching", "KMP basics", "String searching"],
    overview:
      "A trie stores strings character by character so that words with a common prefix share a path. Prefix lookups cost O(length of word). KMP finds a pattern in a text in O(n + m) using a failure table.",
    recognize: [
      "Many words need prefix lookups, or wildcard search.",
      "You're searching a grid for many words at once (Word Search II).",
      "You need substring search faster than O(n·m).",
    ],
    template: `class Node { Node[] next = new Node[26]; boolean end; }
Node root = new Node();

void insert(String w) {
    Node cur = root;
    for (char c : w.toCharArray()) {
        int i = c - 'a';
        if (cur.next[i] == null) cur.next[i] = new Node();
        cur = cur.next[i];
    }
    cur.end = true;
}`,
    pitfalls: [
      "In Word Search II, remove words from the trie once found. It avoids duplicates and speeds things up.",
      "Searching for a word and searching for a prefix differ: one checks the end flag, the other doesn't.",
    ],
    problems: [
      "Implement Trie (Prefix Tree)|implement-trie-prefix-tree|M",
      "Design Add and Search Words Data Structure|design-add-and-search-words-data-structure|M",
      "Word Search II|word-search-ii|H",
      "Find the Index of the First Occurrence in a String|find-the-index-of-the-first-occurrence-in-a-string|E",
      "Repeated String Match|repeated-string-match|M",
    ],
  },
  {
    slug: "bit-manipulation",
    phase: 2,
    name: "Bit Manipulation",
    priority: "Medium",
    concepts: ["XOR", "AND / OR", "Shifts", "Bit masks", "Bit counting"],
    overview:
      "Bit tricks give O(1) space answers to some problems. XOR cancels matching pairs, x & (x − 1) clears the lowest set bit, and shifts let you read or set individual bits.",
    recognize: [
      "Every element appears twice except one. XOR them all.",
      "You need to count set bits, reverse bits, or do arithmetic without + and −.",
      "Subsets of a small set can be stored as a bitmask.",
    ],
    template: `x & (x - 1)      // clear the lowest set bit
x & -x           // isolate the lowest set bit
(x >> i) & 1     // read bit i
x | (1 << i)     // set bit i
a ^ a == 0, a ^ 0 == a   // XOR cancels pairs
Integer.bitCount(x)      // number of set bits`,
    pitfalls: [
      "Java has no unsigned int. Use >>> for a logical right shift.",
      "Counting Bits: bits[i] = bits[i >> 1] + (i & 1).",
    ],
    problems: [
      "Single Number|single-number|E",
      "Number of 1 Bits|number-of-1-bits|E",
      "Counting Bits|counting-bits|E",
      "Reverse Bits|reverse-bits|E",
      "Sum of Two Integers|sum-of-two-integers|M",
    ],
  },
  {
    slug: "design",
    phase: 3,
    name: "Advanced Data Structures & Design",
    priority: "Medium–High",
    concepts: ["HashMap + doubly linked list", "Heaps", "Ordered sets (TreeMap)", "Custom data structures", "Amortized complexity"],
    overview:
      "Design problems ask you to build a class that meets specific time bounds per operation. Usually that means combining two structures: a hash map for O(1) lookup, plus a linked list, heap or TreeMap for ordering.",
    recognize: [
      "The problem says \"Implement a class with these methods in O(1) or O(log n)\".",
      "You need recency (LRU) or frequency (LFU) ordering.",
      "There's a timestamp lookup (TreeMap floorKey) or weighted random sampling.",
    ],
    template: `// LRU in a few lines (be ready to hand-roll it too)
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;
    LRUCache(int cap) { super(cap, 0.75f, true); this.cap = cap; }
    public int get(int k) { return super.getOrDefault(k, -1); }
    public void put(int k, int v) { super.put(k, v); }
    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
        return size() > cap;
    }
}`,
    pitfalls: [
      "Interviewers often want LRU built by hand with a HashMap and a doubly linked list.",
      "List each operation's required complexity before you choose structures.",
    ],
    problems: [
      "LRU Cache|lru-cache|M",
      "LFU Cache|lfu-cache|H",
      "Implement Stack using Queues|implement-stack-using-queues|E",
      "Time Based Key-Value Store|time-based-key-value-store|M",
      "Design Twitter|design-twitter|M",
      "Random Pick with Weight|random-pick-with-weight|M",
      "Insert Delete GetRandom O(1) – Duplicates Allowed|insert-delete-getrandom-o1-duplicates-allowed|H",
      "Design Circular Queue|design-circular-queue|M",
      "Maximum Frequency Stack|maximum-frequency-stack|H",
      "Design a Food Rating System|design-a-food-rating-system|M",
    ],
  },
  {
    slug: "advanced-patterns",
    phase: 3,
    name: "Additional Challenging Patterns",
    priority: "Medium",
    concepts: ["Merge-sort counting", "BFS on grids/words", "Dijkstra / binary search on grids", "DP on squares & palindromes", "DP + binary search"],
    overview:
      "These problems mix patterns you already know. Merge sort can count inversions. BFS works on implicit graphs like Word Ladder. Swim in Rising Water combines Dijkstra with binary search. Job Scheduling combines DP with binary search.",
    recognize: [
      "You need to count pairs (i < j) that meet a condition. Count during merge sort.",
      "The problem asks for the fewest transformations or steps. Use BFS on an implicit graph.",
      "Weighted intervals (Job Scheduling): sort them, then DP with binary search.",
    ],
    template: `// Count cross pairs during merge sort (Reverse Pairs)
int sort(int[] a, int lo, int hi) {         // [lo, hi)
    if (hi - lo <= 1) return 0;
    int mid = (lo + hi) >>> 1;
    int cnt = sort(a, lo, mid) + sort(a, mid, hi);
    for (int i = lo, j = mid; i < mid; i++) {
        while (j < hi && (long) a[i] > 2L * a[j]) j++;
        cnt += j - mid;
    }
    merge(a, lo, mid, hi);                  // standard merge step
    return cnt;
}`,
    pitfalls: [
      "Expand around the centre for palindromes, checking both odd and even lengths.",
      "Word Ladder: try each character position with each letter a–z, not every pair of words.",
    ],
    problems: [
      "Count of Smaller Numbers After Self|count-of-smaller-numbers-after-self|H",
      "Reverse Pairs|reverse-pairs|H",
      "Shortest Path in Binary Matrix|shortest-path-in-binary-matrix|M",
      "Word Ladder|word-ladder|H",
      "Swim in Rising Water|swim-in-rising-water|H",
      "Maximal Square|maximal-square|M",
      "Palindromic Substrings|palindromic-substrings|M",
      "Longest Palindromic Substring|longest-palindromic-substring|M",
      "Maximum Profit in Job Scheduling|maximum-profit-in-job-scheduling|H",
      "Maximum Number of Events That Can Be Attended|maximum-number-of-events-that-can-be-attended|M",
    ],
  },
];

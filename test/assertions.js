if (typeof require !== 'undefined') {
  if (typeof require.paths !== 'undefined')
    require.paths.unshift('lib/');
  var assert = require('assert');
}

exports['test equal'] = function() {
  assert.equal(true, true, 'True should be true');
};

exports['test ok'] = function() {
  assert.ok(true, 'True should be OK');
};

exports['test strictEqual'] = function() {
  assert.strictEqual('1', '1', "'1' should be equal to '1'");
  assert.strictEqual(1, 1, '1 should be equal to 1');
};

exports['test notStrictEqual'] = function() {
  assert.notStrictEqual(1, '1');
  assert.notStrictEqual('1', 1);
};

exports['test deepEqual'] = function() {
  assert.deepEqual(1, 1);
  assert.deepEqual('1', '1');
  assert.deepEqual(new Date(1), new Date(1));
  assert.deepEqual([1, 2, 3], [1, 2, 3]);
  assert.deepEqual(
    [[3, 2, 1], 2, [1, 2, 3]],
    [[3, 2, 1], 2, [1, 2, 3]]
  );
  assert.deepEqual(
    { name: 'Alex', position: 'Expert Button Pusher' },
    { name: 'Alex', position: 'Expert Button Pusher' }
  );
};

exports['test notDeepEqual'] = function() {
  assert.notDeepEqual(1, 2);
  assert.notDeepEqual('1', '2');
  assert.notDeepEqual(new Date(1), new Date(2));
  assert.notDeepEqual([1, 2, 3], [3, 2, 1]);
  assert.notDeepEqual(
    [[3, 2, 1], 2, [1, 2, 3]],
    [[3, 2, 1], 2, [1, 2, 1]]
  );
  assert.notDeepEqual(
    { name: 'Alex', position: 'Expert Button Pusher' },
    { name: 'Mike', position: 'Expert Button Pusher' }
  );
};

if (typeof module !== 'undefined')
  if (module === require.main) 
    require('test').run(exports);


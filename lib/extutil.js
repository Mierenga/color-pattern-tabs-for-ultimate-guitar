if (!document.extutil) { 
  document.extutil = ((exports) => {

    /* addProperty */
    exports.addProperty = (ns, key, val, overwrite) => {
      if (!document[ns]) { document[ns] = {}; }
      else if (overwrite === false && document[ns][key]) { return; }
      document[ns][key] = val;
    }

    return exports;
  })({});
}

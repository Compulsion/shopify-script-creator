  function capitalize(word) {
    return word[0].toUpperCase() + word.substring(1);
  }

  function splitAndCapitalize(splitOn, words) {
    words = words.split(splitOn);
    words[0] = capitalize(words[0]);
    return words.join(' ');
  }

  function splitCamelCase(word) {
    const isCapital = /[A-Z]/;
    const seperator = " ";
    let isFirstCapital = true;
    const newWord = [];
    word = word.split('');
    for (const index in word) {
      const letter = word[index];
      if (isCapital.test(letter)) {
        if (!isFirstCapital) {
          newWord.push(seperator + letter);
        } else {
          isFirstCapital = false;
          newWord.push(letter);
        }
      } else {
        newWord.push(letter);
      }
    }
    return newWord.join('');
  }

  function isCampaignSelect(inputName) {
    if (inputName.indexOf('campaignSelect') === -1) { return false; }
    const temparr = inputName.split('-');
    return temparr.length > 1 && temparr[1].split('_')[0] === temparr[temparr.length - 1].split('_')[0];
  }

  function getParentCampaignInputName(inputName) {
    const temparr = inputName.split('-');

    if (isCampaignSelect(inputName)) {
      temparr.splice(temparr.length - 1, 1);
    } else {
      temparr.splice(temparr.length - 2, 2);
    }

    return temparr.length ? temparr.join('-') : null;
  }

  function getInputType(inputName) {
    const type = inputName.split('-');
    return type[type.length - 1].split('_')[0];
  }

  function getObjectFormats(campaignName, inputs, parentCampaignName) {
    const keys = Object.keys(inputs);
    let targetInput = searchInputs({keys, campaignName, inputs});

    if (!targetInput && parentCampaignName) {
      const parentInput = searchInputs({keys, campaignName: parentCampaignName, inputs});
      if (parentInput) {
        targetInput = searchInputs({keys: Object.keys(parentInput.inputs), campaignName, inputs: parentInput.inputs});
      }
    }

    if (!targetInput) {
      // Default to the last input in the array
      targetInput = inputs[keys[keys.length - 1]];
    }

    let targetObjectInput = null;
    if (targetInput.inputs) {
      targetObjectInput = targetInput.inputs[Object.keys(targetInput.inputs).pop()];
    } else {
      targetObjectInput = targetInput;
    }
    return [targetObjectInput.inputFormat, targetObjectInput.outputFormat];

    function searchInputs({keys, campaignName, inputs}) {
      for (let index = 0, length = keys.length; index < length; index++) {
        const key = keys[index];
        if (Array.isArray(inputs[key])) {
          const foundInput = inputs[key].filter((input) => input.value === campaignName);

          if (foundInput.length > 0) {
            return foundInput[0];
          }
        }
      }
    }
  }

  function formatObject(inOut, value, inputFmt, outputFmt) {
    if (inOut == 'input') {
      // Remove {} or []
      value = value.substring(value.length - 1, 0).substring(1);
      if (value === "") { return value; }

      const lines = value.split('\t').map((line) => {
        const values = line.split('=>').map((value) => value.trim());
        let output = inputFmt;
        for (let index = 0; index < values.length; index++) {
          let type = output.match(/{\w+\??:(\w+):[\w\s'.(),]+:?([\w\s|,]+)?}/)[1];
          if (type === 'array') {
            values[index] = values[index].split(',').map((value) => {
              // Only grab what's in "". Removes unncessary stuff like :discount or ,
              value = value.match(/"(.+)"/);
              return value ? value[1].trim() : "";
            });
            values[index] = values[index].filter((value) => value !== "").join(', ');
          } else {
            // Only grab what's in "". Removes unncessary stuff like :discount or ,
            const value = values[index].match(/"(.+)"/);
            values[index] = value ? value[1] : value;
          }

          // Skip empty string on first iteration (for reasons)
          if (index === 0 && values[index] === "") { continue; }

          if (values[index] !== null) {
            // Replace any $ with $$ so we don't replace $<#> with matches in the regex
            values[index] = values[index].replace(/\$/g, '$$$');

            output = output.replace(/{\w+\??:\w+:[\w\s'.(),]+:?([\w\s|,]+)?}/, values[index]);
          }
        }
        return output;
      }).join('\n');
      return lines;
    } else {
      const inputFormatRepl = inputFmt.replace(/{\w+\??:\w+:[\w\s'.(),]+:?([\w\s|,]+)?}/g, '').trim();
      const splitter = inputFormatRepl[0];
      const lines = value.split('\n').map((line) => {
        let values = line.split(splitter).map((value) => value.trim());
        let output = outputFmt;
        for (let index = 0; index < values.length; index++) {
          const type = output.match(/{(\w+)}/)[1];
          if (type === 'array') {
            // Add "" around each value in the array
            values[index] = values[index].split(',').map((value) => `"${value.trim()}"`);
            values[index] = values[index].filter((value) => value !== '""').join();
          }
          output = output.replace(/{\w+}/i, values[index]);
        }
        return output;
      }).join(',\t');
      return lines;
    }
  }

  // Takes a file version and a minimum version and returns if the file version is later than the minimum version
  function meetsMinimumVersion(version, minimumVersion) {
    const [vmajor, vminor, vpatch] = version.split('.').map((num) => +num );
    const [mvmajor, mvminor, mvpatch] = minimumVersion.split('.').map((num) => +num );
    // Deal with major version
    if (vmajor < mvmajor) { return false; }
    if (vmajor > mvmajor) { return true; }
    // Deal with minor version
    if (vminor < mvminor) { return false; }
    if (vminor > mvminor) { return true; }
    // Deal with patch version
    if (vpatch < mvpatch) { return false; }
    if (vpatch > mvpatch) { return true; }
    // If they're all equal
    return true;
  }

  // Finds the index of an array element using a given function
  function findIndexOf(array, comparison) {
    if (typeof comparison !== 'function') {
      throw Error("Must pass in a comparison function");
    }

    for (let index = 0; index < array.length; index++) {
      if (comparison(array[index])) {
        return index;
      }
    }
    return -1;
  }

export {
  capitalize,
  splitAndCapitalize,
  splitCamelCase,
  isCampaignSelect,
  getParentCampaignInputName,
  getInputType,
  getObjectFormats,
  formatObject,
  meetsMinimumVersion,
  findIndexOf
}

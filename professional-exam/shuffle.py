import re
import random

with open('js/dataProductSorter.js', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_question(match):
    options_str = match.group(1)
    correct_idx_str = match.group(2)
    correct_idx = int(correct_idx_str)
    
    # We will find all occurrences of single-quoted strings
    # in the options array.
    opts_with_quotes = re.findall(r"'([^']*)'", options_str)
    
    if len(opts_with_quotes) != 4:
        # Just return the original match if we fail to parse nicely
        return match.group(0)
    
    correct_opt_text = opts_with_quotes[correct_idx]
    
    # Shuffle the options text
    random.shuffle(opts_with_quotes)
    new_correct_idx = opts_with_quotes.index(correct_opt_text)
    
    # Determine formatting style (multiline or single line)
    # If the original has newlines, we generate multiline
    is_multiline = '\n' in options_str
    
    if is_multiline:
        # use 20 spaces for indentation based on provided structure
        joined_options = ",\n                    ".join(f"'{opt}'" for opt in opts_with_quotes)
        new_options = f"options: [\n                    {joined_options}\n                ],\n                correctAnswer: {new_correct_idx}"
    else:
        joined_options = ", ".join(f"'{opt}'" for opt in opts_with_quotes)
        new_options = f"options: [{joined_options}],\n                correctAnswer: {new_correct_idx}"
        
    return new_options

# Perform the replacement across the file
new_content = re.sub(
    r"options:\s*\[(.*?)\]\s*,\s*correctAnswer:\s*(\d+)",
    replace_question,
    content,
    flags=re.DOTALL
)

with open('js/dataProductSorter.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done shuffling!')

import loaderUtils from 'loader-utils';

export function getLocalIdent(context, _localIdentName, localName, options): string {
  // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/
  )
    ? '[folder]'
    : '[name]';

  const hashLength = 8;

  // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
  const hash = loaderUtils.getHashDigest(
    context.resourcePath + localName,
    'md5',
    'base64',
    hashLength
  );

  // Use loaderUtils to find the file or folder name
  const className = loaderUtils.interpolateName(
    context,
    `${fileNameOrFolder}_${localName}__${hash}`,
    options
  );

  // Remove the .module that appears in every classname when based on the file.
  return className.replace('.module_', '_');
}

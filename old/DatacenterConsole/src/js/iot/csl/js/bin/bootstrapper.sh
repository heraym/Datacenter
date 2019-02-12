#!/bin/sh
#
# Copyright (c) 2017, Oracle and/or its affiliates.  All rights reserved.
#
# This software is dual-licensed to you under the MIT License (MIT) and 
# the Universal Permissive License (UPL).  See the LICENSE file in the root
# directory for license terms.  You may choose either license, or both.
#

## 0. compute current script directory
cdir=$(dirname "$0")
echo "executing ${0} from ${cdir}"

## 1. run node.js application
SEP=
case "$(uname | tr '[A-Z]' '[a-z]')" in
    *inux* | *sunos* | *darwin*)
        SEP=":" ;;
    *)
        SEP=";" ;;
esac
export NODE_PATH="$NODE_PATH${SEP}${cdir}/../modules"
node bootstrapper.js $*

@echo off
@rem
@rem Copyright (c) 2017, Oracle and/or its affiliates.  All rights reserved.
@rem
@rem This software is dual-licensed to you under the MIT License (MIT) and 
@rem the Universal Permissive License (UPL).  See the LICENSE file in the root
@rem directory for license terms.  You may choose either license, or both.
@rem

@rem 0. compute current script directory
set fdir=%~f0
set cdir=%~dp0
echo executing %0 from %fdir%

@rem 1. execute node.js script
set NODE_PATH=%NODE_PATH%;%cdir%..\modules
node networkProvisioner.js %*

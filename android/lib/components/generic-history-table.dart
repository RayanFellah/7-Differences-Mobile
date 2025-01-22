import 'dart:math';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class GenericHistoryTable extends StatefulWidget {
  final List<MapEntry<DateTime, String>> data;
  final String dataLabel;
  GenericHistoryTable({required this.data, required this.dataLabel});

  @override
  _GenericHistoryState createState() => _GenericHistoryState();
}

class _GenericHistoryState extends State<GenericHistoryTable> {
  final controller = PageController();
  final itemsPerPage = 5;

  @override
  Widget build(BuildContext context) {
    final pages = (widget.data.length / itemsPerPage).ceil();

    return ConstrainedBox(
        constraints: BoxConstraints(maxHeight: 300), // Set the maximum height
        child: Stack(
          children: [
            PageView.builder(
              controller: controller,
              itemCount: pages,
              itemBuilder: (context, pageIndex) {
                final firstItemIndex = pageIndex * itemsPerPage;
                final lastItemIndex =
                    min(firstItemIndex + itemsPerPage, widget.data.length);
                final pageItems = widget.data.reversed
                    .toList()
                    .sublist(firstItemIndex, lastItemIndex);

                return Column(children: [
                  Expanded(
                      flex: 2,
                      child: Center(
                          child: DataTable(
                        dataRowHeight: 40,
                        columns: [
                          DataColumn(label: Text('Date')),
                          DataColumn(label: Text(widget.dataLabel)),
                        ],
                        rows: pageItems
                            .map((entry) => DataRow(cells: [
                                  DataCell(Text(DateFormat('yyyy-MM-dd – kk:mm')
                                      .format(entry.key.toLocal())
                                      .toString())),
                                  DataCell(Text(entry.value)),
                                ]))
                            .toList(),
                      ))),
                  Center(
                    child: Text('Page: ${pageIndex + 1} / $pages'),
                  )
                  // ),
                ]);
              },
            ),
            ArrowButton(controller, true),
            ArrowButton(controller, false),
          ],
        ));
  }
}

class ArrowButton extends StatelessWidget {
  final PageController controller;
  final bool isLeft;
  ArrowButton(this.controller, this.isLeft);

  @override
  Widget build(BuildContext context) => Positioned(
        left: isLeft ? 10 : null,
        right: isLeft ? null : 10,
        top: 0,
        bottom: 0,
        child: IconButton(
          icon: isLeft ? Icon(Icons.arrow_back) : Icon(Icons.arrow_forward),
          onPressed: () {
            isLeft
                ? controller.previousPage(
                    duration: Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  )
                : controller.nextPage(
                    duration: Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
          },
        ),
      );
}

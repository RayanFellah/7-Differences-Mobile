import 'package:flutter/material.dart';
import 'package:polydiff/services/items.dart';

// item_widget.dart
// Assurez-vous d'importer vos modèles d'items.

class ItemWidget extends StatelessWidget {
  final Item item;

  ItemWidget({required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Row(
        children: [
          Image.asset(item.path!),
          Text(item.name),
          Text('${item.price} dinars'),
          // item.isPurchased
          //     ? Icon(Icons.check, color: Colors.green) :
          ElevatedButton(
            child: Text('Acheter'),
            onPressed: () {
              // Ajoutez votre logique d'achat ici
            },
          ),
        ],
      ),
    );
  }
}

class CategoryWidget extends StatelessWidget {
  final List<Item> items;
  final String category;

  CategoryWidget({required this.items, required this.category});

  @override
  Widget build(BuildContext context) {
    List<Item> categoryItems =
        items.where((item) => item.type == category).toList();

    return Column(
      children: [
        Text(category.toUpperCase()),
        ...categoryItems.map((item) => ItemWidget(item: item)).toList(),
      ],
    );
  }
}
